
import React from 'react';
import { Route } from 'react-router-dom';

import Pos1TargetPage from './pages/Pos1/Pos1TargetPage';

export const Timbangan = [
    <Route
        key="pos1-target"
        path="pos1/target"
        element={<Pos1TargetPage />}
    />,
];
