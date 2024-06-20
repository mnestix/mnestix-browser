import { Link, Typography } from '@mui/material';
import { Property } from '@aas-core-works/aas-core3.0-typescript/types';
import { messages } from 'lib/i18n/localization';
import { FormattedMessage } from 'react-intl';
import { OpenInNew } from '@mui/icons-material';
import { isValidUrl } from 'lib/util/UrlUtil';

type PropertyComponentProps = {
    readonly property: Property;
};

export function PropertyComponent(props: PropertyComponentProps) {
    const { property } = props;
    if (property && property.value && (property.value === 'true' || property.value === 'false')) {
        return (
            <Typography data-testid="property-content">
                <FormattedMessage {...messages.mnestix.boolean[property.value]} />
            </Typography>
        );
    } else {
        return (
            <Typography data-testid="property-content">
                {isValidUrl(property.value) ? (
                    <Link component="a" href={property.value!} target="_blank" rel="noopener noreferrer">
                        {property.value}
                        <OpenInNew fontSize="small" sx={{ verticalAlign: 'middle', ml: 1 }} />
                    </Link>
                ) : (
                    property.value?.toString() || <FormattedMessage {...messages.mnestix.notAvailable} />
                )}
            </Typography>
        );
    }
}
