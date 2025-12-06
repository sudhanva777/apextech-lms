import { requireStudent } from "@/lib/auth-helpers";
import { prisma } from "@/lib/prisma";
import { User, Mail, Phone, Calendar, BookOpen } from "lucide-react";
import ProfileForm from "./ProfileForm";

export default async function ProfilePage() {
  const session = await requireStudent();

  if (!session.user?.email) {
    return <div>Error: No user information found</div>;
  }

  const user = await prisma.user.findUnique({
    where: { email: session.user.email },
    include: { StudentProfile: true },
  });

  if (!user) {
    return <div>Error: User not found</div>;
  }

  return (
    <div className="max-w-6xl mx-auto">
      <div className="mb-8">
        <h1 className="text-4xl font-extrabold text-gray-900 mb-2">My Profile</h1>
        <p className="text-gray-600">View and update your profile information</p>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        {/* Profile Information */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-lg p-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Profile Information</h2>
          <div className="space-y-4">
            <div className="flex items-start gap-4">
              <div className="p-3 bg-[#EEF2FF] rounded-lg">
                <User className="h-6 w-6 text-[#4F46E5]" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Name</label>
                <p className="text-gray-900 font-semibold">{user.name || "Not set"}</p>
              </div>
            </div>

            <div className="flex items-start gap-4">
              <div className="p-3 bg-[#EEF2FF] rounded-lg">
                <Mail className="h-6 w-6 text-[#4F46E5]" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                <p className="text-gray-900 font-semibold">{user.email || "Not set"}</p>
              </div>
            </div>

            <div className="flex items-start gap-4">
              <div className="p-3 bg-[#EEF2FF] rounded-lg">
                <Phone className="h-6 w-6 text-[#4F46E5]" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Phone</label>
                <p className="text-gray-900 font-semibold">
                  {user.phone || "Not provided"}
                </p>
              </div>
            </div>

            <div className="flex items-start gap-4">
              <div className="p-3 bg-[#EEF2FF] rounded-lg">
                <BookOpen className="h-6 w-6 text-[#4F46E5]" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Program Track
                </label>
                <p className="text-gray-900 font-semibold">
                  {user.StudentProfile?.programTrack || "Not enrolled"}
                </p>
              </div>
            </div>

            <div className="flex items-start gap-4">
              <div className="p-3 bg-[#EEF2FF] rounded-lg">
                <Calendar className="h-6 w-6 text-[#4F46E5]" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Joined Date</label>
                <p className="text-gray-900 font-semibold">
                  {new Date(user.createdAt).toLocaleDateString()}
                </p>
              </div>
            </div>

            {user.StudentProfile?.enrollmentDate && (
              <div className="flex items-start gap-4">
                <div className="p-3 bg-[#EEF2FF] rounded-lg">
                  <Calendar className="h-6 w-6 text-[#4F46E5]" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Enrollment Date
                  </label>
                  <p className="text-gray-900 font-semibold">
                    {new Date(user.StudentProfile.enrollmentDate).toLocaleDateString()}
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Edit Profile Form */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-lg p-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Update Profile</h2>
          <ProfileForm
            initialPhone={user.phone || ""}
            initialProgramTrack={user.StudentProfile?.programTrack || ""}
          />
        </div>
      </div>
    </div>
  );
}

