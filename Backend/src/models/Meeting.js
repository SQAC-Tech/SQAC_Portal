import mongoose from "mongoose";

const MeetingSchema = new mongoose.Schema({
    id,
    title:String,
    startDate: Date,
    startTime: new Date("1970-01-01T10:30:00Z"),
    meetlink:String,
    description:String
});

export default mongoose.model('Meeting', MeetingSchema);
