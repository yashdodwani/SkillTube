export class CourseService {
  constructor() {
    this.courses = new Map();
  }

  async getAllCourses() {
    return Array.from(this.courses.values());
  }

  async getCourseById(id) {
    return this.courses.get(id);
  }
}