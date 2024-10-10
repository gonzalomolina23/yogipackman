'use client'

import React, { useEffect, useRef, useState } from 'react'
import { Button } from "@/components/ui/button"

const CELL_SIZE = 40
const GRID_WIDTH = 19
const GRID_HEIGHT = 21
const PLAYER_SIZE = 120
const GHOST_SIZE = 60

interface GameObject {
  x: number
  y: number
}

interface YogiTeacher extends GameObject {
  direction: 'up' | 'down' | 'left' | 'right'
}

interface YogaPractitioner extends GameObject {
  emoji: string
  direction: 'up' | 'down' | 'left' | 'right'
}

const MAZE_LAYOUT = [
  '###################',
  '#........#........#',
  '#.##.###.#.###.##.#',
  '#o##.###.#.###.##o#',
  '#.................#',
  '#.##.#.#####.#.##.#',
  '#....#...#...#....#',
  '####.### # ###.####',
  '   #.#       #.#   ',
  '####.# ##### #.####',
  '    .  #   #  .    ',
  '####.# ##### #.####',
  '   #.#       #.#   ',
  '####.# ##### #.####',
  '#........#........#',
  '#.##.###.#.###.##.#',
  '#o.#.....#.....#.o#',
  '##.#.#.#####.#.#.##',
  '#....#...#...#....#',
  '#.######.#.######.#',
  '#.................#',
]

const INITIAL_YOGA_PRACTITIONERS: YogaPractitioner[] = [
  { x: 1, y: 1, emoji: '🧘🏻', direction: 'right' },
  { x: 17, y: 1, emoji: '🧘‍♀️', direction: 'left' },
  { x: 1, y: 19, emoji: '🧘🏻‍♂️', direction: 'right' },
  { x: 17, y: 19, emoji: '🧘🏾', direction: 'left' },
  { x: 9, y: 9, emoji: '🧘🏼', direction: 'up' },
  { x: 9, y: 11, emoji: '🧘🏽‍♀️', direction: 'down' },
]

export default function YogiPacMan() {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [score, setScore] = useState(0)
  const [yogiTeacher, setYogiTeacher] = useState<YogiTeacher>({ x: 9, y: 15, direction: 'left' })
  const [yogiImage, setYogiImage] = useState<HTMLImageElement | null>(null)
  const [yogaPractitioners, setYogaPractitioners] = useState<YogaPractitioner[]>(INITIAL_YOGA_PRACTITIONERS)
  const [gameOver, setGameOver] = useState(false)
  const [gameStarted, setGameStarted] = useState(false)
  const [canvasSize, setCanvasSize] = useState({ width: GRID_WIDTH * CELL_SIZE, height: GRID_HEIGHT * CELL_SIZE })

  useEffect(() => {
    const img = new Image()
    img.src = 'https://hebbkx1anhila5yf.public.blob.vercel-storage.com/Subject-AFqxRpxj9gXIMveq4HZ5gHvwfPH27R.png'
    img.onload = () => setYogiImage(img)
  }, [])

  useEffect(() => {
    const handleResize = () => {
      const maxWidth = window.innerWidth * 0.95
      const maxHeight = window.innerHeight * 0.85
      const aspectRatio = GRID_WIDTH / GRID_HEIGHT
      let newWidth = maxWidth
      let newHeight = maxWidth / aspectRatio

      if (newHeight > maxHeight) {
        newHeight = maxHeight
        newWidth = maxHeight * aspectRatio
      }

      setCanvasSize({ width: newWidth, height: newHeight })
    }

    handleResize()
    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [])

  const handleMove = (direction: 'up' | 'down' | 'left' | 'right') => {
    if (gameOver) return

    setYogiTeacher((prev) => {
      let newX = prev.x
      let newY = prev.y

      switch (direction) {
        case 'up':
          newY = Math.max(0, prev.y - 1)
          break
        case 'down':
          newY = Math.min(GRID_HEIGHT - 1, prev.y + 1)
          break
        case 'left':
          newX = Math.max(0, prev.x - 1)
          break
        case 'right':
          newX = Math.min(GRID_WIDTH - 1, prev.x + 1)
          break
      }

      if (MAZE_LAYOUT[newY][newX] !== '#') {
        if (MAZE_LAYOUT[newY][newX] === '.' || MAZE_LAYOUT[newY][newX] === 'o') {
          setScore((prevScore) => prevScore + (MAZE_LAYOUT[newY][newX] === 'o' ? 50 : 10))
          const newMazeLayout = [...MAZE_LAYOUT]
          newMazeLayout[newY] = newMazeLayout[newY].substring(0, newX) + ' ' + newMazeLayout[newY].substring(newX + 1)
          MAZE_LAYOUT.splice(0, MAZE_LAYOUT.length, ...newMazeLayout)
        }
        const newPosition = { x: newX, y: newY, direction }
        moveYogaPractitioners()
        return newPosition
      }
      return prev
    })
  }

  const moveYogaPractitioners = () => {
    setYogaPractitioners((prevPractitioners) => {
      return prevPractitioners.map((practitioner) => {
        let newX = practitioner.x
        let newY = practitioner.y
        let newDirection = practitioner.direction

        switch (practitioner.direction) {
          case 'up':
            newY = Math.max(0, practitioner.y - 1)
            break
          case 'down':
            newY = Math.min(GRID_HEIGHT - 1, practitioner.y + 1)
            break
          case 'left':
            newX = Math.max(0, practitioner.x - 1)
            break
          case 'right':
            newX = Math.min(GRID_WIDTH - 1, practitioner.x + 1)
            break
        }

        if (MAZE_LAYOUT[newY][newX] === '#') {
          // If there's a wall, change direction randomly
          const directions: ('up' | 'down' | 'left' | 'right')[] = ['up', 'down', 'left', 'right']
          newDirection = directions[Math.floor(Math.random() * directions.length)]
          newX = practitioner.x
          newY = practitioner.y
        }

        return { ...practitioner, x: newX, y: newY, direction: newDirection }
      })
    })

    // Check for collision after moving
    if (yogaPractitioners.some(practitioner => 
      Math.abs(practitioner.x - yogiTeacher.x) < 1 && 
      Math.abs(practitioner.y - yogiTeacher.y) < 1
    )) {
      setGameOver(true)
    }
  }

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas || !yogiImage) return

    const ctx = canvas.getContext('2d')
    if (!ctx) return

    const scaleFactor = canvasSize.width / (GRID_WIDTH * CELL_SIZE)

    const drawMaze = () => {
      ctx.fillStyle = '#000080'
      ctx.fillRect(0, 0, canvas.width, canvas.height)
      ctx.fillStyle = '#0000FF'
      MAZE_LAYOUT.forEach((row, y) => {
        row.split('').forEach((cell, x) => {
          if (cell === '#') {
            ctx.fillRect(x * CELL_SIZE * scaleFactor, y * CELL_SIZE * scaleFactor, CELL_SIZE * scaleFactor, CELL_SIZE * scaleFactor)
          } else if (cell === '.' || cell === 'o') {
            ctx.font = `${(cell === 'o' ? 32 : 24) * scaleFactor}px Arial`
            ctx.fillStyle = cell === 'o' ? '#FFA500' : '#FFD700'
            ctx.textAlign = 'center'
            ctx.textBaseline = 'middle'
            ctx.fillText('🥐', (x * CELL_SIZE + CELL_SIZE / 2) * scaleFactor, (y * CELL_SIZE + CELL_SIZE / 2) * scaleFactor)
          }
        })
      })
    }

    const drawYogiTeacher = () => {
      ctx.save()
      ctx.beginPath()
      ctx.arc(
        (yogiTeacher.x * CELL_SIZE + CELL_SIZE / 2) * scaleFactor,
        (yogiTeacher.y * CELL_SIZE + CELL_SIZE / 2) * scaleFactor,
        (PLAYER_SIZE / 2) * scaleFactor,
        0,
        Math.PI * 2
      )
      ctx.closePath()
      ctx.clip()
      
      const tempCanvas = document.createElement('canvas')
      const tempCtx = tempCanvas.getContext('2d')
      if (!tempCtx) return

      const tempScaleFactor = 4
      tempCanvas.width = PLAYER_SIZE * tempScaleFactor
      tempCanvas.height = PLAYER_SIZE * tempScaleFactor

      tempCtx.imageSmoothingEnabled = true
      tempCtx.imageSmoothingQuality = 'high'

      tempCtx.drawImage(yogiImage, 0, 0, tempCanvas.width, tempCanvas.height)

      ctx.drawImage(
        tempCanvas,
        (yogiTeacher.x * CELL_SIZE + CELL_SIZE / 2 - PLAYER_SIZE / 2) * scaleFactor,
        (yogiTeacher.y * CELL_SIZE + CELL_SIZE / 2 - PLAYER_SIZE / 2) * scaleFactor,
        PLAYER_SIZE * scaleFactor,
        PLAYER_SIZE * scaleFactor
      )

      ctx.restore()
    }

    const drawYogaPractitioners = () => {
      yogaPractitioners.forEach((practitioner) => {
        ctx.font = `${GHOST_SIZE * scaleFactor}px Arial`
        ctx.textAlign = 'center'
        ctx.textBaseline = 'middle'
        ctx.fillText(
          practitioner.emoji,
          (practitioner.x * CELL_SIZE + CELL_SIZE / 2) * scaleFactor,
          (practitioner.y * CELL_SIZE + CELL_SIZE / 2) * scaleFactor
        )
      })
    }

    const gameLoop = () => {
      if (gameOver || !gameStarted) return

      ctx.clearRect(0, 0, canvas.width, canvas.height)
      drawMaze()
      drawYogiTeacher()
      drawYogaPractitioners()
      requestAnimationFrame(gameLoop)
    }

    gameLoop()

    const handleKeyPress = (e: KeyboardEvent) => {
      if (!gameStarted) return
      switch (e.key) {
        case 'ArrowUp':
          handleMove('up')
          break
        case 'ArrowDown':
          handleMove('down')
          break
        case 'ArrowLeft':
          handleMove('left')
          break
        case 'ArrowRight':
          handleMove('right')
          break
      }
    }

    window.addEventListener('keydown', handleKeyPress)

    return () => {
      window.removeEventListener('keydown', handleKeyPress)
    }
  }, [yogiTeacher, yogiImage, yogaPractitioners, gameOver, canvasSize, gameStarted])

  const handleNewGame = () => {
    setScore(0)
    setYogiTeacher({ x: 9, y: 15, direction: 'left' })
    setYogaPractitioners(INITIAL_YOGA_PRACTITIONERS)
    setGameOver(false)
    setGameStarted(true)
    MAZE_LAYOUT.splice(0, MAZE_LAYOUT.length, ...MAZE_LAYOUT.map(row => row))
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-900 p-4">
      <h1 className="text-4xl font-bold mb-4 text-yellow-400 font-retro">Yogi Pac-Man</h1>
      <div className="relative">
        <canvas
          ref={canvasRef}
          width={canvasSize.width}
          height={canvasSize.height}
          className="border-4 border-blue-500"
        />
        <div className="absolute top-2 left-2 bg-black bg-opacity-50 p-2 rounded">
          <p className="text-white font-bold">Score: {score}</p>
        </div>
        {!gameStarted && (
          <div className="absolute inset-0 flex flex-col items-center justify-center bg-black bg-opacity-75 p-4">
            <div className="text-white text-2xl mb-4 text-center font-retro">
              <p className="mb-2">
                Bodhi <img src="https://hebbkx1anhila5yf.public.blob.vercel-storage.com/Subject-AFqxRpxj9gXIMveq4HZ5gHvwfPH27R.png" alt="Bodhi" className="inline-block w-12 h-12 align-text-bottom" /> wants to eat all the croissants 🥐
              </p>
              <p className="mb-2">But the yogis 🧘🏻 🧘‍♀️ 🧘🏻‍♂️ 🧘🏾 will try to stop him!</p>
              <p className="text-xl italic">(They're on a gluten-free diet, can you believe it?)</p>
            </div>
            <Button onClick={handleNewGame} className="bg-yellow-400 text-black font-bold py-2 px-4 rounded font-retro text-xl">
              Eat the croissants!
            </Button>
          </div>
        )}
        {gameOver && (
          <div className="absolute inset-0 flex flex-col items-center justify-center bg-black  bg-opacity-75">
            <div className="text-white text-4xl font-bold mb-4 font-retro">Game Over!</div>
            <div className="text-white text-2xl mb-4 font-retro">Final Score: {score}</div>
            <Button onClick={handleNewGame} className="bg-yellow-400 text-black font-bold py-2 px-4 rounded font-retro text-xl">
              One more croissant?
            </Button>
          </div>
        )}
      </div>
      {gameStarted && !gameOver && (
        <div className="mt-4 grid grid-cols-3 gap-2 md:hidden">
          <Button onClick={() => handleMove('left')} className="col-start-1 row-start-2 font-retro">←</Button>
          <Button onClick={() => handleMove('up')} className="col-start-2 row-start-1 font-retro">↑</Button>
          <Button onClick={() => handleMove('down')} className="col-start-2 row-start-3 font-retro">↓</Button>
          <Button onClick={() => handleMove('right')} className="col-start-3 row-start-2 font-retro">→</Button>
        </div>
      )}
      <style jsx global>{`
        @font-face {
          font-family: 'RetroGaming';
          src: url('https://fonts.cdnfonts.com/s/39028/RetroGaming.woff') format('woff');
        }
        .font-retro {
          font-family: 'RetroGaming', sans-serif;
        }
      `}</style>
    </div>
  )
}
