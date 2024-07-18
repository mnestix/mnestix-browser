import { styled } from '@mui/material';
import { useState } from 'react';
import { ShellIcon } from 'components/custom-icons/ShellIcon';

const StyledImage = styled('img')(() => ({
    maxHeight: '88px',
    maxWidth: '88px',
    width: '100%',
    objectFit: 'scale-down',
}));

type StyledImageWithFallBackProps = {
    src: string;
    alt: string;
};

export const ImageWithFallback = (props: StyledImageWithFallBackProps) => {
    const { src, alt } = props;
    const [hasError, setHasError] = useState(false);

    const handleError = () => {
        setHasError(true);
    };

    return (
        <>
            {!hasError ? (
                <StyledImage src={src} onErrorCapture={handleError} alt={alt} />
            ) : (
                <ShellIcon fontSize="large" color="primary" />
            )}
        </>
    );
};
