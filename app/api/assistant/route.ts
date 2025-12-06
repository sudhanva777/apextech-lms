import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { GoogleGenerativeAI } from "@google/generative-ai";

const genAI = new GoogleGenerativeAI(process.env.GOOGLE_API_KEY!);
const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

export const dynamic = 'force-dynamic';

export async function POST(req: NextRequest) {
  try {
    // Get user session to determine role
    const session = await getServerSession(authOptions);
    
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Get user role from database
    const user = await prisma.user.findUnique({
      where: { email: session.user.email! },
      select: { role: true },
    });

    const userRole = user?.role || "STUDENT";

    const body = await req.json() as {
      messages: { role: "user" | "assistant" | "system"; content: string }[];
      userMessage?: string; // Optional: direct user message for saving
    };
    
    const { messages, userMessage } = body;

    // Role-based system prompts
    const studentSystemPrompt = `
You are the ApexTech Student Assistant — a chatbot dedicated ONLY to helping students use the ApexTech LMS.

You must ONLY answer questions about:
- ApexTech portal navigation
- Tasks understanding
- Task submission steps
- Project submission guidance
- Attendance explanation
- Student dashboard help
- Profile update help
- Chat system usage
- Basic concepts from ApexTech Data Science syllabus needed for completing tasks
- Understanding admin feedback on tasks/projects

STRICT RULES:
- ❌ Do NOT answer anything unrelated to ApexTech LMS.
- ❌ Do NOT answer general knowledge, news, politics, celebrities, sports, math, coding outside syllabus, or external topics.
- ❌ Do NOT give personal, emotional, medical, legal, or financial advice.
- ❌ Do NOT invent any facts about ApexTech not provided by the platform.
- ❌ Do NOT generate harmful or sensitive content.

If user asks anything outside ApexTech LMS, reply:
"I can only help you with the ApexTech portal, your tasks, projects, attendance, and LMS-related questions."

STYLE:
- Friendly, simple, clear, supportive.
- No complex jargon.
- Always helpful and encouraging.
`;

    const adminSystemPrompt = `
You are the ApexTech Admin Assistant — a chatbot dedicated ONLY to helping admins manage the ApexTech LMS.

You must ONLY answer questions about:
- Managing students
- Assigning tasks
- Reviewing and accepting/rejecting task submissions
- Reviewing and accepting/rejecting project submissions
- Providing admin workflow steps
- Attendance marking and updates
- Viewing dashboard analytics
- Understanding student progress
- Using admin portal tools and features

STRICT RULES:
- ❌ Do NOT answer anything outside ApexTech admin operations.
- ❌ No general knowledge, news, politics, science, or unrelated topics.
- ❌ No medical, legal, emotional, personal advice.
- ❌ Do NOT create or guess ApexTech business info.
- ❌ Do NOT produce harmful or sensitive content.

If user asks something unrelated to admin tasks, reply:
"I can only help you with ApexTech admin tasks like managing students, tasks, projects, and attendance."

STYLE:
- Professional, concise, and direct.
- Provide clear actionable steps.
`;

    // Global safety rules (applied to both roles)
    const globalRules = `
GLOBAL RULES (Both Roles):
- Never hallucinate or invent company details.
- Stay strictly inside the ApexTech LMS ecosystem.
- Refuse all unrelated requests politely.
- Never generate harmful, unsafe, or restricted content.
- Keep responses short, structured, and helpful.
`;

    // Select prompt based on role and add global rules
    const rolePrompt = userRole === "ADMIN" ? adminSystemPrompt : studentSystemPrompt;
    const systemPrompt = rolePrompt + "\n\n" + globalRules;

    const userConversation = messages
      .map(m => `${m.role.toUpperCase()}: ${m.content}`)
      .join("\n");

    const prompt = systemPrompt + "\n\n" + userConversation;

    const result = await model.generateContent(prompt);
    const text = result.response.text();

    // Get user ID from database
    const dbUser = await prisma.user.findUnique({
      where: { email: session.user.email! },
      select: { id: true },
    });

    if (!dbUser) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // Get the last user message from the messages array (the most recent one)
    const userMessages = messages.filter(m => m.role === "user");
    const lastUserMessage = userMessages[userMessages.length - 1];

    // Save user message if it exists (use direct userMessage if provided, otherwise use from array)
    const messageToSave = userMessage || lastUserMessage?.content;
    if (messageToSave) {
      await prisma.chatHistory.create({
        data: {
          id: crypto.randomUUID(),
          userId: dbUser.id,
          role: "USER",
          message: messageToSave,
        },
      });
    }

    // Save assistant reply
    await prisma.chatHistory.create({
      data: {
        id: crypto.randomUUID(),
        userId: dbUser.id,
        role: "ASSISTANT",
        message: text,
      },
    });

    return NextResponse.json({ reply: text });
  } catch (err) {
    console.error("Gemini error:", err);
    return NextResponse.json({ error: "Failed to generate reply" }, { status: 500 });
  }
}

