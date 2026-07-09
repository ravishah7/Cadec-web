
import mongoose, { Document, Schema, Types } from "mongoose";

export interface IFacultyMember extends Types.Subdocument {
  name: string;
  role: string;
  department: string;
}

export interface IStudentCoordinator extends Types.Subdocument {
  name: string;
  role: string;
  department: string;
}

export interface IMajorEvent extends Types.Subdocument {
  title: string;
  description: string;
  icon: string;
}

export interface ICompetitionWinner extends Types.Subdocument {
  name: string;
  startup: string;
  position: string;
  amount: string;
}

export interface ICompetition extends Types.Subdocument {
  title: string;
  subtitle: string;
  winners: Types.DocumentArray<ICompetitionWinner>;
}

export interface IAboutContent extends Document {
  facultyMembers: Types.DocumentArray<IFacultyMember>;
  studentCoordinators: Types.DocumentArray<IStudentCoordinator>;
  majorEvents: Types.DocumentArray<IMajorEvent>;
  competitions: Types.DocumentArray<ICompetition>;
  createdAt: Date;
  updatedAt: Date;
}
const FacultyMemberSchema = new Schema<IFacultyMember>({
  name:       { type: String, required: true, trim: true },
  role:       { type: String, required: true, trim: true },
  department: { type: String, required: true, trim: true },
});

const StudentCoordinatorSchema = new Schema<IStudentCoordinator>({
  name:       { type: String, required: true, trim: true },
  role:       { type: String, required: true, trim: true },
  department: { type: String, required: true, trim: true },
});

const MajorEventSchema = new Schema<IMajorEvent>({
  title:       { type: String, required: true, trim: true },
  description: { type: String, required: true },
  icon:        { type: String, required: true, default: "Calendar" },
});

const CompetitionWinnerSchema = new Schema<ICompetitionWinner>({
  name:     { type: String, required: true, trim: true },
  startup:  { type: String, required: true, trim: true },
  position: { type: String, required: true, trim: true },
  amount:   { type: String, required: true, trim: true },
});

const CompetitionSchema = new Schema<ICompetition>({
  title:    { type: String, required: true, trim: true },
  subtitle: { type: String, default: "" },
  winners:  [CompetitionWinnerSchema],
});

const AboutContentSchema = new Schema<IAboutContent>(
  {
    facultyMembers:      [FacultyMemberSchema],
    studentCoordinators: [StudentCoordinatorSchema],
    majorEvents:         [MajorEventSchema],
    competitions:        [CompetitionSchema],
  },
  { timestamps: true }
);

export default mongoose.model<IAboutContent>("AboutContent", AboutContentSchema);