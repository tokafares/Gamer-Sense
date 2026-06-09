export interface Answer {
  id: string
  text: string
}

export interface Question {
  id: string
  type: string
  lane: string
  text: string
  imageUrl: string | null
  hint: string | null
  options: Answer[]
  correctAnswer: string
  explanation: string
}
