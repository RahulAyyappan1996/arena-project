import React from 'react';
import { EDCSuiteContainer } from './EDCSuiteContainer';
import { Button } from 'your-button-library';

const AppWithEDCNavigation = () => {
    const handleAccessEDC = () => {
        // Logic to access the complete 8-module EDC system
        console.log('Accessing EDC system...');
    };

    return (
        <EDCSuiteContainer>
            <div>
                <h1>Your App Title</h1>
                <Button onClick={handleAccessEDC}>Access EDC System</Button>
                {/* Include other components or features of your app here */}
            </div>
        </EDCSuiteContainer>
    );
};

export default AppWithEDCNavigation;
