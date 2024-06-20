import { TextField } from '@mui/material';
import { messages } from 'lib/i18n/localization';
import { FormattedMessage } from 'react-intl';
import { useState } from 'react';
import { isValidLong } from 'lib/util/LongValidationUtil';

interface LongPropertyEditComponentProps {
    dataValue: string;
    onChange: (dataValue: string) => void;
}

export function LongPropertyEditComponent(props: LongPropertyEditComponentProps) {
    const [data, setData] = useState(props.dataValue);
    const [isValidInput, setIsValidInput] = useState(true);

    const onValueChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        if (isValidLong(event.target.value) || event.target.value === '') {
            setData(event.target.value);
            props.onChange(event.target.value);
            setIsValidInput(true);
        } else if (event.target.value === '-') {
            setData(event.target.value);
            props.onChange(event.target.value);
            setIsValidInput(false);
        }
    };

    return (
        <TextField
            label={<FormattedMessage {...messages.mnestix.value} />}
            value={data}
            onChange={onValueChange}
            fullWidth
            error={!isValidInput}
            helperText={!isValidInput && <FormattedMessage {...messages.mnestix.errorMessages.invalidLong} />}
        />
    );
}
