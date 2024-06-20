'use client';
import React, { PropsWithChildren, createContext, useContext, useState } from 'react';
import { AssetAdministrationShell } from '@aas-core-works/aas-core3.0-typescript/types';
import { SubmodelDescriptor } from 'lib/types/registryServiceTypes';

type CurrentAasContextType = {
    aasState: [AssetAdministrationShell | null, React.Dispatch<React.SetStateAction<AssetAdministrationShell | null>>];
    submodelDescriptorState: [
        SubmodelDescriptor[] | null,
        React.Dispatch<React.SetStateAction<SubmodelDescriptor[] | null>>,
    ];
};

const CurrentAasContext = createContext<CurrentAasContextType | undefined>(undefined);

export const useCurrentAasContext = () => useContext(CurrentAasContext) as CurrentAasContextType;

export const useAasState = () => {
    const context = useContext(CurrentAasContext);
    if (!context) {
        throw new Error('useAasState must be used within a CurrentAasContextProvider');
    }
    return context.aasState;
};

export const useSubmodelDescriptorState = () => {
    const context = useContext(CurrentAasContext);
    if (!context) {
        throw new Error('useSubmodelDescriptorState must be used within a CurrentAasContextProvider');
    }
    return context.submodelDescriptorState;
};

export const CurrentAasContextProvider = (props: PropsWithChildren) => {
    const aasState = useState<AssetAdministrationShell | null>(null);
    const submodelDescriptorState = useState<SubmodelDescriptor[] | null>(null);

    return (
        <CurrentAasContext.Provider value={{ aasState, submodelDescriptorState }}>
            {props.children}
        </CurrentAasContext.Provider>
    );
};
