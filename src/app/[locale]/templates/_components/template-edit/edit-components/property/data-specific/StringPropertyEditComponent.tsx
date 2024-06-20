import { TextField } from '@mui/material';
import { messages } from 'lib/i18n/localization';
import { FormattedMessage } from 'react-intl';

interface StringPropertyEditComponentProps {
    dataValue: string;
    onChange: (dataValue: string) => void;
}

export function StringPropertyEditComponent(props: StringPropertyEditComponentProps) {
    const onValueChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        props.onChange(event.target.value);
    };

    return (
        <TextField
            defaultValue={props.dataValue}
            label={<FormattedMessage {...messages.mnestix.value} />}
            onChange={onValueChange}
            fullWidth
        />
    );
}
