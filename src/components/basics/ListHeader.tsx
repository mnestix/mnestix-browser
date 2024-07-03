'use client'
import { Typography } from '@mui/material';
import { messages } from "lib/i18n/localization";
import { FormattedMessage } from "react-intl";

type ListHeaderProps = {
    namespace: string,
    keyValue: string
}

export default function ListHeader(props: ListHeaderProps) {
    const {namespace, keyValue} = props;
    
    return (
        <Typography variant="h2" textAlign="left" marginBottom={2}>
            <FormattedMessage {...messages.mnestix[namespace][keyValue]} />
        </Typography>
    );
}
