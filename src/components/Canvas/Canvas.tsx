import { HTMLAttributes, useEffect, useRef } from 'react'

import './Canvas.css'

interface IProps extends HTMLAttributes<HTMLCanvasElement> {
  imageUrl?: string
  onImageLoad?: (imageData: ImageData) => void
}

function Canvas(props: IProps): JSX.Element {
  const { imageUrl, onImageLoad, ...canvasProps } = props
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    const image = new Image()

    function onLoad(): void {
      const canvas = canvasRef.current
      if (canvas) {
        canvas.width = image.width
        canvas.height = image.height
        const context = canvas.getContext('2d')
        if (context) {
          context.drawImage(image, 0, 0)
          if (onImageLoad) {
            onImageLoad(context.getImageData(0, 0, image.width, image.height))
          }
        }
      }
    }

    function onError(): void {
      // eslint-disable-next-line no-console
      console.error("The provided file couldn't be loaded as an Image media")
    }

    if (imageUrl) {
      image.onload = onLoad
      image.onerror = onError
      image.src = imageUrl
    }
  }, [imageUrl, onImageLoad])

  return <canvas className="Canvas" ref={canvasRef} {...canvasProps} />
}

Canvas.defaultProps = {
  height: 0,
  width: 0,
}

export default Canvas
