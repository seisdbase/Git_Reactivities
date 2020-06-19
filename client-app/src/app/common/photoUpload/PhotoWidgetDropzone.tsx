import React, {useCallback} from 'react'
import {useDropzone} from 'react-dropzone'
import Icon from 'semantic-ui-react/dist/commonjs/elements/Icon';
import { Header } from 'semantic-ui-react';

interface IProps {
    setFiles: (files: object[]) => void;   //Object array which returns void
}

const dropzoneStyles = {
    border: 'dashed 3px',
    borderColor: '#eee',
    borderRadius: '5px',
    paddingTop: '30px',
    textAlign: 'center' as 'center',
    height: '200px'
  };

  const dropzoneActive = {
    borderColor: 'green'
  };

const PhotoWidgetDropzone:React.FC<IProps> = ({setFiles}) => {
  const onDrop = useCallback(acceptedFiles => {
       setFiles(acceptedFiles.map((file:object) => Object.assign(file,{
           preview: URL.createObjectURL(file)   //the unmount for this is in PhotoUploadWidget
       })))
  }, [setFiles])

  const {getRootProps, getInputProps, isDragActive} = useDropzone({onDrop})  //React hook

return (
    <div
      {...getRootProps()}
      style={
        isDragActive ? { ...dropzoneStyles, ...dropzoneActive } : dropzoneStyles
      }
    >
      <input {...getInputProps()} />
      <Icon name='upload' size='huge' />
      <Header content='Drop image here' />
    </div>
  );
};

export default PhotoWidgetDropzone;
