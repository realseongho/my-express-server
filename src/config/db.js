import mongoose from "mongoose";

// 비동기 처리를 위한 async 키워드 사용
// await는 실제 비동기 처리 시 사용하는 키워드
const connectDB = async () => {
  try {
    await mongoose.connect("mongodb://localhost:27017/my-express-server", {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log("MongoDB connected successfully");
  } catch (err) {
    console.log("MongoDB connection failed", err.message);
    process.exit(1);
  }
};

export default connectDB;
