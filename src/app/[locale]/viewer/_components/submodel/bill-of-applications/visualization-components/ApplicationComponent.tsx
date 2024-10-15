import { SyntheticEvent, useState } from 'react';
import { ChevronRight, ExpandMore } from '@mui/icons-material';
import { SimpleTreeView } from '@mui/x-tree-view';
import { Entity, ISubmodelElement, KeyTypes } from '@aas-core-works/aas-core3.0-typescript/types';
import { SubmodelViewObject } from 'lib/types/SubmodelViewObject';
import { getKeyType } from 'lib/util/KeyTypeUtil';
import { generateSubmodelViewObjectFromSubmodelElement } from 'lib/util/SubmodelViewObjectUtil';
import { ApplicationTreeItem } from './ApplicationTreeItem';

type ApplicationComponentProps = {
    readonly entity: Entity;
};

export function ApplicationComponent(props: ApplicationComponentProps) {
    const { entity } = props;
    const [expandedTreeItems, setExpandedTreeItems] = useState<string[]>(['0']);
    const entityTree: SubmodelViewObject = generateSubmodelViewObjectFromSubmodelElement(entity, '0');

    const handleToggle = (_event: SyntheticEvent, nodeIds: string[]) => {
        setExpandedTreeItems(nodeIds);
    };

    const renderTree = (tree: SubmodelViewObject) => {
        const hasChildEntities =
            tree.children.filter((child) => child.data && getKeyType(child.data) === KeyTypes.Entity).length > 0;
        const applicationUrl = tree.children.find((child) => child.name === 'ApplicationURL')?.propertyValue;
        return (
            <ApplicationTreeItem
                key={tree.id}
                itemId={tree.id}
                label={tree.name}
                data={tree.data as ISubmodelElement}
                hasChildEntities={hasChildEntities}
                applicationUrl={applicationUrl}
            >
                {hasChildEntities ? tree.children.map((childTree) => renderTree(childTree)) : undefined}
            </ApplicationTreeItem>
        );
    };

    return (
        <SimpleTreeView
            slots={{ collapseIcon: ExpandMore, expandIcon: ChevronRight }}
            expandedItems={expandedTreeItems}
            onExpandedItemsChange={handleToggle}
            disableSelection
        >
            {renderTree(entityTree)}
        </SimpleTreeView>
    );
}
