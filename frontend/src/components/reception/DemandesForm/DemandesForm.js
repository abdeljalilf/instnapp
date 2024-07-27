import React, { useState } from 'react';
import './DemandesForm.css';

const DemandesForm = () => {
    const getCurrentDate = () => {
        const today = new Date();
        return today.toISOString().split('T')[0];
    };

    const apiBaseUrl = process.env.REACT_APP_API_BASE_URL;

    const [personalInfo, setPersonalInfo] = useState({
        name: '',
        address: '',
        phone: '',
        email: '',
        requestingDate:getCurrentDate(),
        dilevery_delay:getCurrentDate()
    });

    const [samples, setSamples] = useState([
        {
            sampleType: '',
            samplingLocation: '',
            samplingDate: getCurrentDate(),
            sampledBy: '',
            broughtBy:'',
            sampleSize:'',
            sampleObservations:'',
            analysisDetails: [
                {
                    analysisType: '',
                    parameter: '',
                    element: [],
                    technique: ''
                }
            ]
        }
    ]);

    const handlePersonalInfoChange = (e) => {
        const { name, value } = e.target;
        setPersonalInfo({
            ...personalInfo,
            [name]: value
        });
    };

    const handleSamplesChange = (index, e) => {
        const { name, value } = e.target;
        const updatedSamples = [...samples];
        updatedSamples[index] = {
            ...updatedSamples[index],
            [name]: value
        };
        setSamples(updatedSamples);
    };

    const handleAnalysisDetailsChange = (sampleIndex, analysisIndex, e) => {
        const { name, value, checked } = e.target;
        
        const updatedSamples = [...samples];
        const updatedAnalysisDetails = [...updatedSamples[sampleIndex].analysisDetails];
        
        if (name === 'element') {
            const newElements = checked
                ? [...updatedAnalysisDetails[analysisIndex].element, value]
                : updatedAnalysisDetails[analysisIndex].element.filter(el => el !== value);
            updatedAnalysisDetails[analysisIndex] = {
                ...updatedAnalysisDetails[analysisIndex],
                element: newElements
            };
        } else {
            updatedAnalysisDetails[analysisIndex] = {
                ...updatedAnalysisDetails[analysisIndex],
                [name]: value
            };
        }
    
        updatedSamples[sampleIndex].analysisDetails = updatedAnalysisDetails;
        setSamples(updatedSamples);
    };
    

    const addAnalysis = (sampleIndex) => {
        const updatedSamples = [...samples];
        updatedSamples[sampleIndex].analysisDetails.push({
            analysisType: '',
            parameter: '',
            element: [],
            technique: ''
        });
        setSamples(updatedSamples);
    };

    const deleteAnalysis = (sampleIndex) => {
        const updatedSamples = [...samples];
        if (updatedSamples[sampleIndex].analysisDetails.length > 1) {
            updatedSamples[sampleIndex].analysisDetails.pop();
        }
        setSamples(updatedSamples);
    };

    
    const addSample = () => {
        setSamples([...samples, {
            sampleType: '',
            samplingLocation: '',
            samplingDate: getCurrentDate(),
            sampledBy: '',
            broughtBy:'',
            sampleSize:'',
            sampleObservations:'',
            analysisDetails: [
                {
                    analysisType: '',
                    parameter: '',
                    element: [],
                    technique: ''
                }
            ]
        }]);
    };

    const deleteSample = () => {
        const updatedSamples = [...samples];
        if (updatedSamples.length > 1) {
            updatedSamples.pop();
        }
        setSamples(updatedSamples);
    };
    
    const handleSubmit = async (e) => {
        e.preventDefault();
        const response = await fetch(`${apiBaseUrl}/instnapp/backend/routes/reception/demandesForm.php`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                personalInfo,
                samples
            })
        });
        console.log("personal: " + personalInfo+ " samples: "+ samples)
        const result = await response.json();
        
        // Supposons que 'result' contient la réponse JSON de votre requête
        if (result.success) {
            // Construire le message à afficher dans l'alerte
            let message = 'Formulaire soumis avec succès!\n\n';
            
            // Ajouter la référence du client au message si elle est définie
            if (result.clientReference) {
                message += 'Référence du client : ' + result.clientReference + '\n';
            }

            // Afficher l'alerte avec le message complet
            alert(message);
        } else {
            alert('Erreur lors de la soumission du formulaire.');
        }

        
        // Réinitialiser le formulaire après soumission
        setPersonalInfo({ name: '', address: '', phone: '', email: '' });
        setSamples([{
            sampleType: '',
            samplingLocation: '',
            samplingDate: getCurrentDate(),
            sampledBy: '',
            broughtBy:'',
            sampleSize:'',
            sampleObservations:'',
            analysisDetails: [
                {
                    analysisType: '',
                    parameter: '',
                    element: [],
                    technique: ''
                }
            ]
        }]);
    };

    const getParameterOptions = (sampleType) => {
        switch (sampleType) {
            case 'eau':
                return ['Metaux', 'Hg', 'Anion', 'Cation', 'Elements radioactif'];
            case 'sol':
            case 'minerais':
                return ['Metaux', 'Hg', 'Elements radioactif'];
            case 'denree':
                return ['Metaux', 'Metaux lourds', 'Elements nutritif', 'Elements radioactif'];
            case 'air':
                return ['PM', 'Metaux', 'Randon'];
            default:
                return [];
        }
    };

    const getElementOptions = (parameter) => {
        switch (parameter) {
            case 'Metaux':
                return ["Calcium (Ca)", "Magnesium (Mg)", "Sodium (Na)", "Potassium (K)", "Fer (Fe)", 
                    "Manganese (Mn)", "Aluminium (Al)", "Plomb (Pb)", "Cuivre (Cu)", "Zinc (Zn)", 
                    "Chrome (Cr)", "Nickel (Ni)", "Arsenic (As)", "Cadmium (Cd)", "Cobalt (Co)"];
            case 'Metaux lourds':
            case 'Elements nutritif':
                return ["Calcium (Ca)", "Magnesium (Mg)", "Sodium (Na)", "Potassium (K)", "Fer (Fe)", 
                    "Manganese (Mn)", "Aluminium (Al)", "Plomb (Pb)", "Cuivre (Cu)", "Zinc (Zn)", 
                    "Chrome (Cr)", "Nickel (Ni)", "Arsenic (As)", "Cadmium (Cd)", "Cobalt (Co)", 
                    "Phosphore (P)", "Selenium (Se)", "Molybdene (Mo)", "Titane (Ti)", "Brome (Br)", 
                    "Strontium (Sr)", "Nyobium (Nb)", "Zirconium (Zr)", "Tantale (Tl)", "Silicium (Si)", 
                    "Chlore (Cl)"];
            case 'Anion':
                return ["Chorure (Cl-)", "Bicarbonate (HCO3-)", "Phosphore (PO4--)", "Nitrate (NO3-)", "Sulfate (SO4--)"];
            case 'Cation':
                return ["Sodium (Na+)", "Potassium (K+)", "Magnesium (Mg++)", "Calcium (Ca++)"];
            case 'Elements radioactif':
                return ["Uranum-238 (U238)", "Thorium-232 (Th232)", "Potassium-40 (K40)", "Cesium137 (Cs137)"];
            case 'PM':
                return ["PM"];
            case 'Randon':
                return ["Randon"];
            case 'Hg':
                return ["Hg"];
            default:
                return [];
        }
    };

    const getTechniqueOptions = (sampleType, parameter) => {
        if (parameter === 'Metaux' && (sampleType === 'eau' || sampleType === 'denree')) {
            return ["Spectrometrie d'Absportion Atomic (SAA)"];
        } else if (parameter === 'Hg') {
            return ['Analyseur Direct de Mercure (ADM)'];
        } else if (parameter === 'Anion' || parameter === 'Cation') {
            return ['Chromatographie Ionique (CI)'];
        } else if (parameter === 'Elements radioactif') {
            return ['Spectrometre Gamma', 'Spectrometre alpha'];
        } else if ((parameter === 'Metaux' && (sampleType === 'sol' || sampleType === 'minerais')) ||
            parameter === 'Elements nutritif' || parameter === 'Metaux lourds') {
            return ['Fluorescence X a Energie Dispersive (FXDE)'];
        } else if (parameter === 'PM') {
            return ['Drafimetrie'];
        } else if ((parameter === 'Metaux' || parameter === 'Randon') && sampleType === 'air') {
            return ['Fluorescence X a Energie Dispersive (FXDE)'];
        }
        return [];
    };

    return (
        <form onSubmit={handleSubmit}>
            <div className="form-header">
                <h2>Informations personnelles du client</h2>
            </div>
            <div className="form-group">
                <label>Nom du client:</label>
                <input
                    type="text"
                    name="name"
                    value={personalInfo.name}
                    onChange={handlePersonalInfoChange}
                    required
                />
            </div>
            <div className="form-group">
                <label>Adresse:</label>
                <input
                    type="text"
                    name="address"
                    value={personalInfo.address}
                    onChange={handlePersonalInfoChange}
                    required
                />
            </div>
            <div className="form-group">
                <label>Téléphone:</label>
                <input
                    type="text"
                    name="phone"
                    value={personalInfo.phone}
                    onChange={handlePersonalInfoChange}
                    required
                />
            </div>
            <div className="form-group">
                <label>Email:</label>
                <input
                    type="email"
                    name="email"
                    value={personalInfo.email}
                    onChange={handlePersonalInfoChange}
                    required
                />
            </div>

            {samples.map((sample, index) => (
                <div key={index} className="sample-group">
                    <div className="form-header">
                        <h2>Informations sur les échantillons {index + 1}</h2>
                    </div>
                    
                    <h3>Informations sur l'échantillon {index + 1}</h3>
                    <div className="form-group">
                        <label>Type d'échantillon:</label>
                        <select
                            name="sampleType"
                            value={sample.sampleType}
                            onChange={(e) => handleSamplesChange(index, e)}
                            required
                        >
                            <option value="">Sélectionner un type</option>
                            <option value="eau">Eau</option>
                            <option value="sol">Sol</option>
                            <option value="minerais">Minerais</option>
                            <option value="denree">Denrée alimentaire</option>
                            <option value="air">Air</option>
                        </select>
                    </div>
                    <div className="form-group">
                        <label>Lieu de prélèvement:</label>
                        <input
                            type="text"
                            name="samplingLocation"
                            value={sample.samplingLocation}
                            onChange={(e) => handleSamplesChange(index, e)}
                            required
                        />
                    </div>
                    <div className="form-group">
                        <label>Date de prélèvement:</label>
                        <input
                            type="date"
                            name="samplingDate"
                            value={sample.samplingDate}
                            onChange={(e) => handleSamplesChange(index, e)}
                            required
                        />
                    </div>
                    <div className="form-group">
                        <label>Prélevé par:</label>
                        <input
                            type="text"
                            name="sampledBy"
                            value={sample.sampledBy}
                            onChange={(e) => handleSamplesChange(index, e)}
                            required
                        />
                    </div>
                    <div className="form-group">
                        <label>Apporté par:</label>
                        <input
                            type="text"
                            name="broughtBy"
                            value={sample.broughtBy}
                            onChange={(e) => handleSamplesChange(index, e)}
                            required
                        />
                    </div>
                    <div className="form-group">
                        <label>Quantite de l'echantillon:</label>
                        <input
                            type="text"
                            name="sampleSize"
                            value={sample.sampleSize}
                            onChange={(e) => handleSamplesChange(index, e)}
                            required
                        />
                    </div>
                    <div className="form-group">
                        <label>Observations:</label>
                        <input
                            type="text"
                            name="sampleObservations"
                            value={sample.sampleObservations}
                            onChange={(e) => handleSamplesChange(index, e)}
                            required
                        />
                    </div>
                    {sample.analysisDetails.map((analysis, analysisIndex) => (
                        <div key={analysisIndex} className="analysis-group">
                            <h3>Détails des analyses {analysisIndex + 1} sur l'échantillon {index + 1}</h3>
                            <div className="form-group">
                                <label>Type d'analyse:</label>
                                <select
                                    name="analysisType"
                                    value={analysis.analysisType}
                                    onChange={(e) => handleAnalysisDetailsChange(index, analysisIndex, e)}
                                    required
                                >
                                    <option value="">Sélectionner un type</option>
                                    <option value="Qualitative">Qualitative</option>
                                    <option value="Quantitative">Quantitative</option>
                                </select>
                            </div>
                            <div className="form-group">
                                <label>Paramètre:</label>
                                <select
                                    name="parameter"
                                    value={analysis.parameter}
                                    onChange={(e) => handleAnalysisDetailsChange(index, analysisIndex, e)}
                                    required
                                >
                                    <option value="">Sélectionner un paramètre</option>
                                    {getParameterOptions(sample.sampleType).map((option) => (
                                        <option key={option} value={option}>
                                            {option}
                                        </option>
                                    ))}
                                </select>
                            </div>
                            <div className="form-group">
                                <label className="selected-elements">Éléments d'intérêt: {analysis.element.join(', ')}</label>
                                <div className="checkbox-group">
                                    {getElementOptions(analysis.parameter).map((option) => (
                                        <label key={option} className="checkbox-label">
                                            <input
                                                type="checkbox"
                                                name="element"
                                                value={option}
                                                checked={analysis.element.includes(option)}
                                                onChange={(e) => handleAnalysisDetailsChange(index, analysisIndex, e)}
                                            />
                                            {option}
                                        </label>
                                    ))}
                                </div>
                            </div>

                            <div className="form-group">
                                <label>Technique:</label>
                                <select
                                    name="technique"
                                    value={analysis.technique}
                                    onChange={(e) => handleAnalysisDetailsChange(index, analysisIndex, e)}
                                    required
                                >
                                    <option value="">Sélectionner une technique</option>
                                    {getTechniqueOptions(sample.sampleType, analysis.parameter).map((option) => (
                                        <option key={option} value={option}>
                                            {option}
                                        </option>
                                    ))}
                                </select>
                            </div>
                            
                        </div>
                    ))}
                    <div className="form-group">
                            <label>Delai de livraison:</label>
                                <input
                                    type="date"
                                    name="dilevery_delay"
                                    value={personalInfo.dilevery_delay}
                                    onChange={(e) => handlePersonalInfoChange(e)}
                                    required
                                />
                    </div>
                    <div className='analysis-buttons'>
                    <button type="button" onClick={() => addAnalysis(index)} className='button-add'>
                        Ajouter une analyse
                    </button>
                    <button type="button" onClick={() => deleteAnalysis(index)} className='button-delete'>
                        Supprimer une analyse
                    </button>
                    </div>
                </div>
            ))}
            <div className='analysis-buttons'>
            <button type="button" onClick={addSample} className='button-add'>
                Ajouter un échantillon
            </button>
            <button type="button" onClick={deleteSample} className='button-delete'>
                Supprimer un échantillon
            </button>
            </div>
            <button type="submit" className='submit-button'>Soumettre</button>
        </form>
    );
};

export default DemandesForm;
