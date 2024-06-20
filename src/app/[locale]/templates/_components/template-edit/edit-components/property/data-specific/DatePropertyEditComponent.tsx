import { useState } from 'react';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { LocalizationProvider, DesktopDatePicker, MobileDatePicker, DateValidationError } from '@mui/x-date-pickers';
import { messages } from 'lib/i18n/localization';
import { FormattedMessage } from 'react-intl';
import { useIsMobile } from 'lib/hooks/UseBreakpoints';
import moment from 'moment';

interface DatePropertyEditComponentProps {
    dataValue: string;
    onChange: (dataValue: string) => void;
}

export function DatePropertyEditComponent(props: DatePropertyEditComponentProps) {
    const [data, setData] = useState<string | null>(props.dataValue);
    const [isValid, setIsValid] = useState(true);
    const calenderFormat = 'yyyy-MM-dd';
    const isMobile = useIsMobile();

    const onValueChange = (newValue: Date | null) => {
        if (newValue) {
            const val = parseDate(newValue);
            props.onChange(val);
            setData(val);
        } else {
            props.onChange('');
            setData('');
        }
    };

    const onInvalidInput = (reason: DateValidationError) => {
        setIsValid(!reason);
    };

    function parseDate(date: Date) {
        //according to format yyyy-mm-dd
        return date.getFullYear() + '-' + (date.getMonth() + 1) + '-' + date.getDate();
    }

    const startingData = (): Date => {
        if (data) {
            return moment(data, calenderFormat).toDate();
        } else {
            const today = new Date();
            const newDate = parseDate(today);
            props.onChange(newDate);
            setData(newDate);
            return today;
        }
    };

    return (
        <LocalizationProvider dateAdapter={AdapterDateFns}>
            {isMobile ? (
                <MobileDatePicker
                    label={<FormattedMessage {...messages.mnestix.value} />}
                    value={startingData()}
                    onChange={onValueChange}
                    format={calenderFormat}
                    onError={onInvalidInput}
                    slotProps={{
                        textField: {
                            helperText: !isValid && (
                                <FormattedMessage {...messages.mnestix.errorMessages.invalidDate} />
                            ),
                        },
                    }}
                />
            ) : (
                <DesktopDatePicker
                    label={<FormattedMessage {...messages.mnestix.value} />}
                    value={startingData()}
                    onChange={onValueChange}
                    format={calenderFormat}
                    onError={onInvalidInput}
                    slotProps={{
                        textField: {
                            helperText: !isValid && (
                                <FormattedMessage {...messages.mnestix.errorMessages.invalidDate} />
                            ),
                            fullWidth: true,
                        },
                    }}
                />
            )}
        </LocalizationProvider>
    );
}
