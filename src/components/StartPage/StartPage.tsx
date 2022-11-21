import Canvas from '../Canvas/Canvas'
import FileUpload from '../FileUpload/FileUpload'

import './StartPage.css'

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
    <div className="StartPage">
      <FileUpload onChange={onImageChange} />
      <Canvas imageUrl={image} onImageLoad={onImageLoad} />
      <button disabled={!imageData} onClick={onStart} type="button">
        Start
      </button>
    </div>
  )
}

export default StartPage
