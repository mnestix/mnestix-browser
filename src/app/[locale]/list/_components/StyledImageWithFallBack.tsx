import { styled } from '@mui/material';
import { useState } from 'react';
import DefaultThumbnail from 'assets/AasDefaultThumbnail.svg';

// Define the props for the styled component
interface StyledImageProps {
    size: number;
}

const StyledImage = styled('img')<StyledImageProps>(({ size }) => ({
    height: size,
    maxWidth: size,
    width: '100%',
    objectFit: 'scale-down',
}));

type StyledImageWithFallBackProps = {
    src: string | undefined;
    alt: string;
    size: number;
    onClickHandler?: () => void;
};

export const ImageWithFallback = (props: StyledImageWithFallBackProps) => {
    const { src, alt, size, onClickHandler } = props;
    const [hasError, setHasError] = useState(false);

    const handleError = () => {
        setHasError(true);
    };

    const ImageContent = (
        <StyledImage
            src={src}
            onError={handleError}
            alt={alt}
            size={size}
            onClick={() => {
                if (onClickHandler) {
                    onClickHandler();
                }
            }}
            style={{ cursor: onClickHandler ? 'pointer' : 'auto' }}
        />
    );

    const FallbackContent = (
        <DefaultThumbnail
            style={{
                maxHeight: size,
                maxWidth: size,
                width: '100%',
                cursor: onClickHandler ? 'pointer' : 'auto'
            }}
            alt={alt}
            onClick={() => {
                if (onClickHandler) {
                    onClickHandler();
                }
            }}
        />
    );

    return (
        <>
            {(!hasError && props.src) ? (
                ImageContent
            ) : (
                FallbackContent
            )}
        </>
    );
};
