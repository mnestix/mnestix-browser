'use client';

import React, { useState } from 'react';
import { QrReader } from 'react-qr-reader';
import { Result } from '@zxing/library';

const QrCodeReader = () => {
    const [data, setData] = useState<string>('No result');
    const [error, setError] = useState<string | null>(null);

    const handleScan = (result: Result) => {
        setData(result.getText());
    };

    const handleError = (err: Error) => {
        console.error(err);
        setError(err.message);
    };
    
    const customVideoStyle: React.CSSProperties = {
        width: '250px',
        borderRadius: '10px',
        boxShadow: '0px 4px 10px rgba(0, 0, 0, 0.15)',
        objectFit: 'cover' // Ensures the video covers the area proportionately
    };

    return (
        <div>
            <QrReader
                constraints={{ facingMode: 'environment' }}
                scanDelay={300}
                onResult={(result, error) => {
                    if (result) handleScan(result);
                    if (error) handleError(error);
                }}
                videoStyle={customVideoStyle}
                
            />
            {error && <p>Error: {error}</p>}
            <p>{data}</p>
        </div>
    );
};

export default QrCodeReader;