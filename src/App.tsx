import { useEffect, useState } from 'react'
import './App.css'
import useFindWord, { type UseFindWordResult } from './hooks/useFindWord'
import useValidation, { type UseFindValidationResult } from './hooks/useValidation'

function App() {
  const [isPlaying, setIsPlaying] = useState<boolean>(false)
  const [stack, setStack] = useState<string>("")
  const [word, setWord] = useState<string>("")

  const handlePlay = () => {
    clearValidation()
    clearFindWord()
    setIsPlaying(true)
  }

  /* --- VALIDATION HOOK SETUP --- */
  const { 
    isValid,
    validationError,
    clearValidation
  }: UseFindValidationResult = useValidation(stack, word, isPlaying)

  /* --- FIND WORD HOOK SETUP --- */
  const {
    bestWord,
    loading,
    error,
    score,
    clearFindWord }: UseFindWordResult = useFindWord(stack, word, (isPlaying && isValid === true))


  /**
   * Cleanup useEffect that turns the playing state off in the case that the validation fails.
   */
  useEffect(() => {
    if (!isPlaying) return;

    // Very important to do a specific false check here.
    // Null means that the validation has not yet been done. False means that it failed.
    if (isValid === false) {
      setIsPlaying(false)
    }
  }, [isPlaying, isValid])

  /**
   * Cleanup useEffect that turns the playing state off in the case that the best word is found or an error occurs.
   */
  useEffect(() => {
    if (!isPlaying) return;

    if (bestWord || error) {
      setIsPlaying(false)
    }
  }, [bestWord, error, isPlaying, clearValidation])

  return (
    <div className="flex items-center justify-center gap-4">
      <div className="flex flex-col items-center justify-center">
        <label>Stack</label>
        <input type="text" className="w-full max-w-md p-2 border border-gray-300 rounded-md" onBlur={(e) => setStack(e.target.value)} disabled={loading} />
      </div>
      <div className="flex flex-col items-center justify-center">
        <label>Word</label>
        <input type="text" className="w-full max-w-md p-2 border border-gray-300 rounded-md" onBlur={(e) => setWord(e.target.value)} disabled={loading} />
      </div>
        <button className="bg-blue-500 text-white p-2 rounded-md" onClick={handlePlay} disabled={loading}>Play</button>
        {validationError && <p>Error: {validationError.message}</p>}
        {loading && <p>Loading...</p>}
        {error && <p>Error: {error}</p>}
        {bestWord && <p>Best word: {bestWord} : {score}</p>}
      </div>
  )
}

export default App
