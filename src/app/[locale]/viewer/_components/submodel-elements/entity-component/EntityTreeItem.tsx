import * as React from 'react';
import { TreeItem, TreeItemContentProps, TreeItemProps, useTreeItemState } from '@mui/x-tree-view';
import clsx from 'clsx';
import Typography from '@mui/material/Typography';
import { Box, Button, IconButton, styled, useTheme } from '@mui/material';
import { Entity, ISubmodelElement, KeyTypes, RelationshipElement } from '@aas-core-works/aas-core3.0-typescript/types';
import { AssetIcon } from 'components/custom-icons/AssetIcon';
import { ArrowForward, ArticleOutlined, InfoOutlined, PinDropOutlined } from '@mui/icons-material';
import { IconCircleWrapper } from 'components/basics/IconCircleWrapper';
import { FormattedMessage } from 'react-intl';
import { messages } from 'lib/i18n/localization';
import { useRouter } from 'next/navigation';
import { SubmodelElementRenderer } from '../SubmodelElementRenderer';
import { EntityDetailsDialog } from './EntityDetailsDialog';
import { RelationShipDetailsDialog } from './RelationShipDetailsDialog';
import { GetKeyType } from 'lib/util/KeyTypeUtil';
import { useApis } from 'components/azureAuthentication/ApiProvider';

interface CustomTreeItemProps extends TreeItemProps {
    data?: ISubmodelElement;
}

interface CustomTreeItemContentProps extends TreeItemContentProps {
    data?: ISubmodelElement;
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
    const navigate = useRouter();
    const theme = useTheme();
    const { classes, className, label, itemId, icon: iconProp, expansionIcon, displayIcon, data } = props;
    const { disabled, expanded, selected, focused, handleExpansion } = useTreeItemState(itemId);
    const { discoveryServiceClient } = useApis();
    const toggleIcon = iconProp || expansionIcon || displayIcon;
    const isEntity = GetKeyType(data as ISubmodelElement) === KeyTypes.Entity;
    const dataIcon = isEntity ? (
        <AssetIcon fontSize="small" color="primary" />
    ) : (
        <ArticleOutlined fontSize="small" color="primary" />
    );
    const isRelationShip = GetKeyType(data as ISubmodelElement) === KeyTypes.RelationshipElement;
    const assetId = isEntity ? (data as Entity).globalAssetId : undefined;
    const showDataDirectly = [KeyTypes.Property, KeyTypes.MultiLanguageProperty].find(
        (mt) => mt === GetKeyType(data as ISubmodelElement),
    );
    const [detailsModalOpen, setDetailsModalOpen] = React.useState(false);

    const handleExpansionClick = (event: React.MouseEvent<HTMLDivElement, MouseEvent>) => {
        handleExpansion(event);
    };

    const handleAssetNavigateClick = async (event: React.MouseEvent<HTMLElement, MouseEvent>) => {
        event.stopPropagation();
        if (assetId) {
            // Check if the Asset Id exists in the same repository as the "parent AAS",
            // if so, then navigate to the asset-redirect page of this Mnestix instance,
            // if not, just navigate to the specified URL which might lead anywhere.
            const aasIds = (await discoveryServiceClient.getAasIdsByAssetId(assetId)).result;
            if (aasIds.length === 0) {
                window.open(assetId, '_blank');
            } else {
                navigate.push('/asset/' + encodeURIComponent(assetId));
            }
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
                data-testid="bom-entity"
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
                    {assetId && !showDataDirectly && (
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
                                <FormattedMessage {...messages.mnestix.view} />
                            </Button>
                        </>
                    )}
                    {showDataDirectly && <SubmodelElementRenderer submodelElement={data} wrapInDataRow={false} />}
                </Box>
                {isRelationShip && (
                    <Box sx={{ ml: '2px', pl: 1, display: 'flex' }}>
                        <>
                            <IconButton sx={{ mr: 1 }} onClick={handleDetailsClick}>
                                <PinDropOutlined data-testid="entity-info-icon" sx={{ color: 'text.secondary' }} />
                            </IconButton>
                        </>
                    </Box>
                )}
            </Box>
            {isEntity && (
                <EntityDetailsDialog
                    open={detailsModalOpen}
                    handleClose={handleDetailsModalClose}
                    entity={props.data as Entity}
                />
            )}
            {isRelationShip && (
                <RelationShipDetailsDialog
                    open={detailsModalOpen}
                    handleClose={handleDetailsModalClose}
                    relationship={props.data as RelationshipElement}
                />
            )}
        </>
    );
});

export const EntityTreeItem = (props: CustomTreeItemProps) => {
    const { data, ...other } = props;
    /* eslint-disable @typescript-eslint/no-explicit-any */
    return <StyledTreeItem ContentComponent={CustomContent} ContentProps={{ data } as any} {...other} />;
};
