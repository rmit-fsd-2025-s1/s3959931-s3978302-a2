export interface Lecturer {
  id: string;
  name: string;
  title: string;
  specialization: string;
  bio: string;
  courses: string; // Could be string[]
  awards?: string;
  experience?: string;
  certifications?: string;
  publications?: string;
  contact: string;
  avatarPath?: string; // Added to match UserAccount and for consistency
}
