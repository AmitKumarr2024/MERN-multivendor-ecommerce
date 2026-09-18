export interface StaffPhoto {
  url: string | null;
  publicId: string | null;
}

export interface Staff {
  _id: string;
  shop: string;
  name: string;
  role: string;
  bio: string;
  profilePhoto: StaffPhoto;
  joiningDate: string;
  isActive: boolean;
  ratingAverage: number;
  feedbackCount: number;
  experience?: string;
  createdAt: string;
  updatedAt: string;
}

export interface AttendanceRecord {
  _id: string;
  staff: string;
  date: string;
  status: "present" | "absent" | "leave";
  note: string;
}

export interface MonthlyAttendance {
  month: number;
  year: number;
  totalWorkingDays: number;
  presentDays: number;
  absentDays: number;
  leaveDays: number;
  attendancePercentage: number;
  records: AttendanceRecord[];
}

export interface StaffPerformance {
  staff: Pick<
    Staff,
    "_id" | "name" | "role" | "isActive" | "ratingAverage" | "feedbackCount"
  > & {
    id: string;
    experience: string;
  };
  attendance: MonthlyAttendance;
}

export interface StaffFeedback {
  _id: string;
  rating: number;
  comment: string;
  createdAt: string;
  buyer: { name: string };
}

export interface FeedbackEligibility {
  eligible: boolean;
  reason?: "no_delivered_order" | "already_reviewed";
  orderId?: string;
}

export interface CreateStaffPayload {
  name: string;
  role: string;
  bio?: string;
  joiningDate: string;
  profilePhoto?: File;
}
