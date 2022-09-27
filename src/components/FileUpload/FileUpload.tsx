import { useEffect, useRef } from 'react'

interface IProps {
  accept: string[]
  onChange?: (fileUrl: string) => void
}

function FileUpload(props: IProps): JSX.Element {
  const { accept, onChange } = props
  const inputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    function handleChange(event: Event): void {
      const target = event.target as HTMLInputElement
      if (target.files?.length && onChange) {
        onChange(URL.createObjectURL(target.files[0]))
      }
    }

    if (inputRef.current) {
      const input = inputRef.current
      input.addEventListener('change', handleChange)
      return () => input.removeEventListener('change', handleChange)
    }
  }, [onChange])

  return (
    <div>
      <input accept={accept.join(', ')} ref={inputRef} type="file" />
    </div>
  )
}

FileUpload.defaultProps = {
  accept: ['image/jpeg', 'image/png', 'image/jpg'],
}

export default FileUpload
