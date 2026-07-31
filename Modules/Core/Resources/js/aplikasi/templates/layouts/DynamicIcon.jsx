import React from 'react';
import * as Icons from 'lucide-react';

export const DynamicIcon = ({ name, size = 18, strokeWidth = 2, className = '' }) => {
    // Ambil komponen secara aman berdasarkan string, fallback ke Home jika tidak ditemukan
    const IconComponent = Icons[name] && typeof Icons[name] === 'function' 
        ? Icons[name] 
        : Icons.Home;

    return <IconComponent size={size} strokeWidth={strokeWidth} className={className} />;
};