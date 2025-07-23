import { useEffect, useState } from 'react'
import type { FocusEvent } from 'react'
import useFindWord, { type UseFindWordResult } from './hooks/useFindWord'
import useValidation, { type UseFindValidationResult } from './hooks/useValidation'

const App: React.FC = () => {
  const [isPlaying, setIsPlaying] = useState<boolean>(false)
  const [rack, setRack] = useState<string>("")
  const [word, setWord] = useState<string>("")

  const handlePlay = (): void => {
    clearValidation()
    clearFindWord()
    setIsPlaying(true)
  }

  /* --- VALIDATION HOOK SETUP --- */
  const { 
    isValid,
    validationError,
    clearValidation
  }: UseFindValidationResult = useValidation(rack, word, isPlaying)

  /* --- FIND WORD HOOK SETUP --- */
  const {
    bestWord,
    loading,
    error,
    score,
    clearFindWord }: UseFindWordResult = useFindWord(rack, word, (isPlaying && isValid === true))

  /* ---- EVENT HANDLERS ---- */
  const handleRackBlur = (e: FocusEvent<HTMLInputElement>): void => setRack(e.target.value)
  const handleWordBlur = (e: FocusEvent<HTMLInputElement>): void => setWord(e.target.value)

  /**
   * Cleanup useEffect that turns the playing state off in the case that the validation fails.
   */
  useEffect((): void => {
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
  useEffect((): void => {
    if (!isPlaying) return;

    if (bestWord || error) {
      setIsPlaying(false)
    }
  }, [bestWord, error, isPlaying, clearValidation])


  return (
    <div data-testid="app-container" className="w-full h-screen flex flex-col items-center justify-center gap-8">
      <h1 data-testid="app-title" className="text-5xl font-bold">Scrabble Word Finder</h1>
      <div data-testid="input-container" className="flex gap-20">
        <div data-testid="rack-input-container" className="flex flex-col gap-4">
          <div className="flex flex-col gap-2">
            <label>Rack*</label>
            <input
              type="text"
              className={`w-[400px] p-2 border rounded-md ${
                validationError && validationError.rack.length > 0 
                  ? 'border-red-500' 
                  : 'border-gray-300'
              }`}
              onBlur={handleRackBlur}
              disabled={loading}
            />
            {validationError && validationError.rack.length > 0 && <p className="text-red-500">{validationError.rack.join(", ")}</p>}
          </div>
          <div data-testid="word-input-container" className="flex flex-col gap-2">
            <label>Word</label>
            <input
              type="text"
              className={`w-[400px] p-2 border rounded-md ${
                validationError && validationError.word.length > 0 
                  ? 'border-red-500' 
                  : 'border-gray-300'
              }`}
              onBlur={handleWordBlur}
              disabled={loading}
            />
            {validationError && validationError.word.length > 0 && <p className="text-red-500">{validationError.word.join(", ")}</p>}
          </div>
          <button
            data-testid="play-button"
            className="p-4 text-xl bg-blue-500 text-white p-2 rounded-md cursor-pointer drop-shadow-md"
            onClick={handlePlay}
            disabled={loading}
          >
            Play
          </button>
        </div>
        <div className="flex flex-col gap-2">
          <div>Results</div>
          <div data-testid="log-container" className="w-[400px] h-full flex flex-col items-center justify-center p-4 border rounded-md border-gray-300">
            {loading && <p>Loading...</p>}
            {validationError && validationError.game.length > 0 && (
              <div className="text-red-500">
                {validationError.game.map((err: string, idx: number) => (
                  <p key={idx}>{err}</p>
                ))}
              </div>
            )}
            {error && <p className="text-red-500">{error}</p>}
            {bestWord && <p>Best word: {bestWord} : {score} points!</p>}
          </div>
        </div>
      </div>
    </div>
  )
}

export default App
