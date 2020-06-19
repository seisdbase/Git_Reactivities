import React, { useRef } from 'react';
import Cropper from 'react-cropper';
import 'cropperjs/dist/cropper.css';

interface IProps {
  setImage: (file: Blob) => void;
  imagePreview: string;
}

const PhotoWidgetCropper: React.FC<IProps> = ({ setImage, imagePreview }) => {
  //  ReactHook useRef
  //returns a mutable ref object whose .current property is initialized to the
  // passed argument (initialValue). The returned object will persist for the full lifetime
  // of the component
  const cropper = useRef<Cropper>(null);

  const cropImage = () => {
    if (
      cropper.current &&
      typeof cropper.current.getCroppedCanvas() === 'undefined'
    ) {
      return;
    }
    cropper &&
      cropper.current &&
      cropper.current.getCroppedCanvas().toBlob((blob: any) => {
        setImage(blob);
      }, 'image/jpeg');
  };

  return (
    <Cropper
      ref={cropper}
      src={imagePreview}
      style={{ height: 200, width: '100%' }}
      // Cropper.js options
      aspectRatio={1 / 1}
      preview='.img-preview'
      guides={false}
      viewMode={1}
      dragMode='move'
      scalable={true}
      cropBoxMovable={true}
      cropBoxResizable={true}
      crop={cropImage}
    />
  );
};

export default PhotoWidgetCropper;


// import React from 'react'

// const PhotoWidgetCropper = () => {
//     return (
//         <div>
            
//         </div>
//     )
// }

// export default PhotoWidgetCropper;
