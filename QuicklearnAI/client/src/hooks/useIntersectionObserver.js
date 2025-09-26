import { useEffect } from 'react'

export function useIntersectionObserver(ref, options = { threshold: 0.1 }) {
  useEffect(() => {
    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add('fade-in')
        }
      })
    }, options)

    const elements = ref.current.querySelectorAll('section')
    elements.forEach((element) => observer.observe(element))

    return () => elements.forEach((element) => observer.unobserve(element))
  }, [ref, options])
}