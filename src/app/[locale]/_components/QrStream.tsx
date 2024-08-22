'use client';

import { useEffect, useRef, useState } from 'react';
import Scanner from 'qr-scanner';

export function QrStream(props: {
    onScan: (scanResult: string) => Promise<void>;
    onLoadingFinished: (successful: boolean) => void;
}) {
    const videoEl = useRef<HTMLVideoElement>(null);
    const scanner = useRef<Scanner>();

    const [showBorder, setShowBorder] = useState<boolean>(false);

    const onScanSuccess = async (result: Scanner.ScanResult) => {
        await props.onScan(result.data);
    };

    useEffect(() => {
        if (videoEl?.current && !scanner.current) {
            scanner.current = new Scanner(videoEl?.current, onScanSuccess, {
                preferredCamera: 'environment',
            });

            scanner?.current
                ?.start()
                .then(() => {
                    setShowBorder(true);
                    props.onLoadingFinished(true);
                })
                .catch(() => props.onLoadingFinished(false));
        }

        return () => {
            if (!videoEl?.current) {
                scanner?.current?.stop();
            }
        };
    }, []);

    return (
        <video
            ref={videoEl}
            height="100%"
            width="100%"
            style={{ objectFit: 'cover', borderRadius: 10, borderStyle: showBorder ? 'solid' : 'none' }}
        ></video>
    );
}
