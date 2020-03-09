import React from 'react';
import { FieldRenderProps } from 'react-final-form'
import { FormFieldProps, Form, Label } from 'semantic-ui-react'


interface IProps 
   extends FieldRenderProps<string, any>, FormFieldProps {}

// React.FC<IProps> = () --> destructured properties
 const TextAreaInput: React.FC<IProps> = ({
    input, 
    width, 
    rows, 
    placeholder,
    meta: {touched, error} 
 }) => {
    return (
        <Form.Field error={touched && !!error}  width={width}>
            <textarea rows={rows} {...input} placeholder={placeholder} />
            {touched && error && (
                    <Label basic content = 'red'>
                            {error}
                    </Label>
            )}
        </Form.Field>   
    )
}

//...input passes eg OnChange handler

export default TextAreaInput;