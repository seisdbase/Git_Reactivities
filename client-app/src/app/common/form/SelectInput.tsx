import React from 'react'
import { FieldRenderProps } from 'react-final-form'
import { FormFieldProps, Form, Label, Select } from 'semantic-ui-react'


interface IProps 
   extends FieldRenderProps<string, any>,
      FormFieldProps {}

 const SelectInput: React.FC<IProps> = (
    {
        input, 
        width, 
        options,   //list of categoties 
        placeholder,
        meta: {touched, error} 
        
    } ) => {
    
    return (
     
        <Form.Field error={touched && !!error} options={options} width={width}>
            <Select 
                value={input.value}
                onChange={(e, data) => input.onChange(data.value)}
                placeholder={placeholder}
                options={options}
            />
            {touched && error && (
                <Label basic content='red'>
                    {error}
                </Label>
            )}
        </Form.Field>


    )
}

export default SelectInput;