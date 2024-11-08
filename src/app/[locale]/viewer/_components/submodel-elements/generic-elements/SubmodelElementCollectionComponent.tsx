import { KeyboardArrowDown, KeyboardArrowUp } from '@mui/icons-material';
import { Box, Button } from '@mui/material';
import { SubmodelElementCollection } from '@aas-core-works/aas-core3.0-typescript/types';
import { NestedContentWrapper } from 'components/basics/NestedContentWrapper';
import { messages } from 'lib/i18n/localization';
import { ReactNode, useState } from 'react';
import { FormattedMessage } from 'react-intl';
import { GenericSubmodelElementComponent } from './GenericSubmodelElementComponent';

enum ExpandButtonText {
    show = 'show',
    hide = 'hide',
}

type SubmodelElementComponentProps = {
    readonly submodelId?: string;
    readonly submodelElementPath?: string;
    readonly submodelElementCollection: SubmodelElementCollection;
};

export function SubmodelElementCollectionComponent({
    submodelId,
    submodelElementPath,
    submodelElementCollection,
}: SubmodelElementComponentProps) {
    const [isExpanded, setIsExpanded] = useState(false);
    const componentList: ReactNode[] = [];

    if (
        !submodelElementCollection.value ||
        (Array.isArray(submodelElementCollection.value) && !submodelElementCollection.value?.length) ||
        !Object.keys(submodelElementCollection.value).length
    ) {
        return <></>;
    }
    submodelElementCollection.value.forEach((val, index) => {
        componentList.push(
            <GenericSubmodelElementComponent
                key={index}
                submodelElement={val}
                hasDivider={!(index === 0)}
                submodelId={submodelId}
                submodelElementPath={submodelElementPath}
            />,
        );
    });

    return (
        <Box>
            <Button
                variant="outlined"
                startIcon={isExpanded ? <KeyboardArrowUp /> : <KeyboardArrowDown />}
                sx={{ my: 1 }}
                onClick={() => setIsExpanded(!isExpanded)}
                data-testid="submodel-dropdown-button"
            >
                <FormattedMessage
                    {...messages.mnestix.showEntriesButton[isExpanded ? ExpandButtonText.hide : ExpandButtonText.show]}
                    values={{ count: `${Object.keys(submodelElementCollection.value).length}` }}
                />
            </Button>
            {isExpanded && <NestedContentWrapper>{componentList}</NestedContentWrapper>}
        </Box>
    );
}
