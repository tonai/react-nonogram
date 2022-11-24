import { useState } from 'react'
import ConfigProvider from '../ConfigProvider/ConfigProvider'

import GamePage from '../GamePage/GamePage'
import Layout from '../Layout/Layout'
import StartPage from '../StartPage/StartPage'

function App(): JSX.Element {
  const [image, setImage] = useState<string>()
  const [imageData, setImageData] = useState<ImageData>()
  const [start, setStart] = useState(false)

  function handleStart(): void {
    setStart(true)
  }

  return (
    <ConfigProvider>
      <Layout>
        {!start && (
          <StartPage
            image={image}
            imageData={imageData}
            onImageChange={setImage}
            onImageLoad={setImageData}
            onStart={handleStart}
          />
        )}
        {Boolean(start) && Boolean(imageData) && (
          <GamePage imageData={imageData as ImageData} />
        )}
      </Layout>
    </ConfigProvider>
  )
}

export default App
