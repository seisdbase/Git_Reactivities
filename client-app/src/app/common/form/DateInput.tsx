import React from 'react'
import { FieldRenderProps } from 'react-final-form'
import { FormFieldProps, Form, Label } from 'semantic-ui-react'
import { DateTimePicker } from 'react-widgets';


interface IProps 
   extends FieldRenderProps<Date, any>, FormFieldProps {}

 const DateInput: React.FC<IProps> = ({
    input, 
    width, 
    placeholder,
    date=false,                     //Separate date and time pickers 
    time=false,
    meta: {touched, error},
    ...rest                        //Rest of properties in DTP

}) => {
     return (

         <Form.Field error={touched && !!error} width={width}>
             <DateTimePicker 
                placeholder={placeholder}
                value={input.value || null}      //null is when creating n nothing there
                onChange={input.onChange}       //get onChange from final-forms
                onBlur={input.onBlur }
                onKeyDown={(e) => e.preventDefault()}
                date={date}
                time={time}
                {...rest as any}
             />
             {touched && error && (
                 <Label basic content='red'>
                     {error}
                 </Label>
             )}
         </Form.Field>

     )
}

export default (DateInput);