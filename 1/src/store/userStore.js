import { create } from 'zustand';
import { persist } from 'zustand/middleware';

const useUserStore = create(
  persist(
    (set) => ({
      tokens: 0,
      completedCourses: [],
      newQuizzes: 0,
      addTokens: (amount) => set((state) => ({ tokens: state.tokens + amount })),
      markCourseCompleted: (courseId) =>
        set((state) => ({
          completedCourses: [...state.completedCourses, courseId],
          tokens: state.tokens + 50 // Reward 50 tokens for course completion
        })),
      isCompleted: (courseId) => useUserStore.getState().completedCourses.includes(courseId),
      setNewQuizzes: (count) => set({ newQuizzes: count }),
      incrementNewQuizzes: () => set((state) => ({ newQuizzes: state.newQuizzes + 1 })),
      clearNewQuizzes: () => set({ newQuizzes: 0 })
    }),
    {
      name: 'user-storage'
    }
  )
);

export default useUserStore;