import { KeyboardArrowDown, KeyboardArrowUp } from '@mui/icons-material';
import { Box, Button } from '@mui/material';
import { DataRow } from 'components/basics/DataRow';
import { NestedContentWrapper } from 'components/basics/NestedContentWrapper';
import { messages } from 'lib/i18n/localization';
import { useState } from 'react';
import { FormattedMessage } from 'react-intl';
import { Submodel } from '@aas-core-works/aas-core3.0-typescript/types';
import { GenericSubmodelDetailComponent } from 'app/[locale]/viewer/_components/submodel/generic-submodel/GenericSubmodelDetailComponent';

export function ExpandableDefaultSubmodelDisplay(props: { submodel: Submodel }) {
    const [isExpanded, setIsExpanded] = useState(false);
    return props.submodel.submodelElements && props.submodel.submodelElements.length ? (
        <DataRow title="All available data" hasDivider={true}>
            <Box>
                <Button
                    variant="outlined"
                    startIcon={isExpanded ? <KeyboardArrowUp /> : <KeyboardArrowDown />}
                    sx={{ my: 1 }}
                    onClick={() => setIsExpanded(!isExpanded)}
                    data-testid="submodel-dropdown-button"
                >
                    <FormattedMessage
                        {...messages.mnestix.showEntriesButton[isExpanded ? 'hide' : 'show']}
                        values={{ count: props.submodel.submodelElements.length }}
                    />
                </Button>
                {isExpanded && (
                    <NestedContentWrapper>
                        <GenericSubmodelDetailComponent submodel={props.submodel} />
                    </NestedContentWrapper>
                )}
            </Box>
        </DataRow>
    ) : (
        <></>
    );
}
