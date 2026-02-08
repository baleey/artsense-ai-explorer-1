import { useState, useCallback } from "react";
import Header from "@/components/Header";
import UploadZone from "@/components/UploadZone";
import AnalyzeButton from "@/components/AnalyzeButton";
import ResultCard from "@/components/ResultCard";
import Footer from "@/components/Footer";

interface AnalysisResult {
  logistic: { style: string; confidence: number };
  xgboost: { style: string; confidence: number };
  cnn: { style: string; confidence: number };
}

import axios from "axios"; // Assure-toi que l'import est en haut

const realAnalysis = async (file: File): Promise<AnalysisResult> => {
  const formData = new FormData();
  formData.append("file", file);

  try {
    const response = await axios.post("http://localhost:8000/predict", formData);
    const data = response.data;

    // On remplit les 3 cartes. Comme tu n'as qu'un modèle CNN pour l'instant, 
    // on met des valeurs fictives pour Logistic et XGBoost pour ne pas casser l'affichage.
    return {
      logistic: { style: "Analyse non dispo.", confidence: 0 },
      xgboost: { style: "Analyse non dispo.", confidence: 0 },
      cnn: { 
        style: data.style, 
        confidence: data.confidence 
      },
    };
  } catch (error) {
    console.error("Erreur Backend:", error);
    throw new Error("Impossible de contacter le serveur Python");
  }
};

const Index = () => {
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [results, setResults] = useState<AnalysisResult | null>(null);
const handleAnalyze = useCallback(async () => {
    if (!selectedImage) return;
    
    setIsAnalyzing(true);
    setResults(null);
    
    try {
      // ON APPELLE LE VRAI BACKEND ICI
      const analysisResults = await realAnalysis(selectedImage);
      setResults(analysisResults);
    } catch (err) {
      alert("Erreur: Vérifie que ton serveur Python est bien lancé (py -3.12 main.py)");
    } finally {
      setIsAnalyzing(false);
    }
  }, [selectedImage]);

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <main className="flex-1 container max-w-5xl mx-auto px-4 pb-12">
        <Header />
        
        <section className="mb-8">
          <UploadZone
            onImageSelect={setSelectedImage}
            selectedImage={selectedImage}
          />
        </section>

        <section className="flex justify-center mb-12">
          <AnalyzeButton
            onClick={handleAnalyze}
            isLoading={isAnalyzing}
            disabled={!selectedImage}
          />
        </section>

        {results && (
          <section className="slide-up">
            <h2 className="font-serif text-2xl font-semibold text-center text-foreground mb-8">
              Résultats de l'analyse
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
             
              <ResultCard
                modelName="CNN - Expert"
                modelType="cnn"
                predictedStyle={results.cnn.style}
                confidence={results.cnn.confidence}
                isExpert
              />
            </div>
          </section>
        )}
      </main>

      <Footer />
    </div>
  );
};

export default Index;
