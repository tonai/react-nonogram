import Canvas from '../Canvas/Canvas'
import FileUpload from '../FileUpload/FileUpload'

interface IProps {
  image?: string
  imageData?: ImageData
  onImageChange?: (fileUrl: string) => void
  onImageLoad?: (imageData: ImageData) => void
  onStart?: () => void
}

function StartPage(props: IProps): JSX.Element {
  const { image, imageData, onImageChange, onImageLoad, onStart } = props

  return (
    <div>
      <FileUpload onChange={onImageChange} />
      <Canvas imageUrl={image} onImageLoad={onImageLoad} />
      <button disabled={!imageData} onClick={onStart} type="button">
        Start
      </button>
    </div>
  )
}

export default StartPage
