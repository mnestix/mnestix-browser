import * as React from 'react';
import { ArrowForward, InfoOutlined } from '@mui/icons-material';
import AppShortcutIcon from '@mui/icons-material/AppShortcut';
import { TreeItem, TreeItemContentProps, TreeItemProps, useTreeItemState } from '@mui/x-tree-view';
import { Box, Button, IconButton, styled, useTheme } from '@mui/material';
import Typography from '@mui/material/Typography';
import clsx from 'clsx';
import { messages } from 'lib/i18n/localization';
import { FormattedMessage } from 'react-intl';
import { Entity, ISubmodelElement, KeyTypes } from '@aas-core-works/aas-core3.0-typescript/types';
import { IconCircleWrapper } from 'components/basics/IconCircleWrapper';
import { AssetIcon } from 'components/custom-icons/AssetIcon';
import { useAasState } from 'components/contexts/CurrentAasContext';
import { encodeBase64 } from 'lib/util/Base64Util';
import { GetKeyType } from 'lib/util/KeyTypeUtil';
import { EntityDetailsDialog } from 'app/[locale]/viewer/_components/submodel-elements/entity-component/EntityDetailsDialog';

interface CustomTreeItemProps extends TreeItemProps {
    data?: ISubmodelElement;
    hasChildEntities: boolean;
    applicationUrl?: string;
}

interface CustomTreeItemContentProps extends TreeItemContentProps {
    data?: ISubmodelElement;
    hasChildEntities: boolean;
    applicationUrl?: string;
}

const StyledTreeItem = styled(TreeItem)(({ theme }) => ({
    '.MuiTreeItem-content': {
        userSelect: 'none',
        margin: 0,
        borderBottom: '1px solid',
        borderColor: theme.palette.divider,
        '&.Mui-focused': {
            backgroundColor: 'transparent',
        },
        '&.Mui-focused:hover': {
            backgroundColor: theme.palette.action.hover,
        },
        '&.Mui-focused.Mui-selected': {
            backgroundColor: theme.palette.action.selected,
        },
    },
}));

const CustomContent = React.forwardRef(function CustomContent(props: CustomTreeItemContentProps, ref) {
    const theme = useTheme();
    const {
        classes,
        className,
        label,
        itemId,
        icon: iconProp,
        expansionIcon,
        displayIcon,
        data,
        hasChildEntities,
        applicationUrl,
    } = props;
    const { disabled, expanded, selected, focused, handleExpansion } = useTreeItemState(itemId);
    const toggleIcon = iconProp || expansionIcon || displayIcon;
    const isEntity = data && GetKeyType(data) === KeyTypes.Entity;
    const [aas] = useAasState();
    const assetId = aas?.assetInformation.globalAssetId;

    const dataIcon = hasChildEntities ? (
        <AssetIcon fontSize="small" color="primary" />
    ) : (
        <AppShortcutIcon fontSize="small" color="primary" />
    );
    const [detailsModalOpen, setDetailsModalOpen] = React.useState(false);

    const handleExpansionClick = (event: React.MouseEvent<HTMLDivElement, MouseEvent>) => {
        handleExpansion(event);
    };

    const handleAssetNavigateClick = (event: React.MouseEvent<HTMLElement, MouseEvent>) => {
        event.stopPropagation();
        const win = window.open(applicationUrl + '?AssetId=' + (assetId ? encodeBase64(assetId) : ''), '_blank');
        if (win != null) {
            win.focus();
        }
    };

    const handleDetailsClick = (event: React.MouseEvent<HTMLElement, MouseEvent>) => {
        event.stopPropagation();
        setDetailsModalOpen(true);
    };

    const handleDetailsModalClose = () => {
        setDetailsModalOpen(false);
    };

    return (
        <>
            <Box
                className={clsx(className, classes.root, {
                    [classes.expanded]: expanded,
                    [classes.selected]: selected,
                    [classes.focused]: focused,
                    [classes.disabled]: disabled,
                })}
                onClick={handleExpansionClick}
                ref={ref as React.Ref<HTMLDivElement>}
                data-testid="boa-entity"
            >
                <Box data-testid="expand-entity-icon" className={classes.iconContainer} sx={{ py: 1 }}>
                    {toggleIcon}
                </Box>
                <Box
                    sx={{
                        [theme.breakpoints.down(480)]: {
                            flex: 1,
                            overflow: 'hidden',
                            textOverflow: 'ellipsis',
                            whiteSpace: 'nowrap',
                        },
                    }}
                    display="flex"
                    alignItems="center"
                >
                    <IconCircleWrapper>{dataIcon}</IconCircleWrapper>
                    <Typography
                        component="div"
                        sx={{
                            py: 2,
                            pr: 1,
                            overflow: 'hidden',
                            textOverflow: 'ellipsis',
                            whiteSpace: 'nowrap',
                        }}
                        className={classes.label}
                    >
                        {label}
                    </Typography>
                </Box>
                <Box sx={{ ml: 'auto', pl: 1, display: 'flex' }}>
                    {!hasChildEntities && (
                        <>
                            <IconButton sx={{ mr: 1 }} onClick={handleDetailsClick}>
                                <InfoOutlined data-testid="entity-info-icon" sx={{ color: 'text.secondary' }} />
                            </IconButton>
                            <Button
                                endIcon={<ArrowForward />}
                                size="small"
                                onClick={handleAssetNavigateClick}
                                data-testid="view-asset-button"
                            >
                                <FormattedMessage {...messages.mnestix.open} />
                            </Button>
                        </>
                    )}
                </Box>
            </Box>
            {isEntity && (
                <EntityDetailsDialog
                    open={detailsModalOpen}
                    handleClose={handleDetailsModalClose}
                    entity={props.data as Entity}
                />
            )}
        </>
    );
});

export const ApplicationTreeItem = (props: CustomTreeItemProps) => {
    const { data, hasChildEntities, applicationUrl, ...other } = props;
    /* eslint-disable @typescript-eslint/no-explicit-any */
    return (
        <StyledTreeItem
            ContentComponent={CustomContent}
            ContentProps={{ data, hasChildEntities, applicationUrl } as any}
            {...other}
        />
    );
};
