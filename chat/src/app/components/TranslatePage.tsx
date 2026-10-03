import React, {useEffect, useRef, useState} from 'react';
import {
  checkTranslationAvailability, 
  detectPrimaryLanguage, 
  translate,
  translateStreaming,
  AvailabilityStatus
} from '../services/TranslateService';
import {DocsRenderer} from "../tools/DocsRenderer";
import Tabs from './Tabs';
import { useSEOData, seoConfigs } from '../hooks/useSEOData';
import { Spinner } from './Spinner';

const languages = [
  {code: 'en', name: 'English'},
  {code: 'uk', name: 'Ukrainian'},
  {code: 'es', name: 'Spanish'},
  {code: 'ja', name: 'Japanese'},
  {code: 'fr', name: 'French'},
  {code: 'de', name: 'German'},
  {code: 'ru', name: 'Russian'},
  // Add more languages as needed
];


const TranslatePage: React.FC = () => {
  useSEOData(seoConfigs.translate, '/translate');
  
  const [sourceText, setSourceText] = useState('Hello! How are you today?');
  const [translation, setTranslation] = useState('');
  const [sourceLanguage, setSourceLanguage] = useState('en');
  const [targetLanguage, setTargetLanguage] = useState('es');
  const [translationAbility, setTranslationAbility] = useState<AvailabilityStatus>();
  const [errorMessage, setErrorMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [useStreaming, setUseStreaming] = useState(false);
  const selectRef = useRef<HTMLSelectElement>(null);
  const requestId = useRef(0);
  const availabilityRequestId = useRef(0);

  const invalidateOutput = () => {
    requestId.current += 1;
    setIsLoading(false);
    setTranslation('');
    setErrorMessage('');
  };

  useEffect(() => {
    const current = ++availabilityRequestId.current;
    setTranslationAbility(undefined);
    if (sourceLanguage === targetLanguage || typeof window.Translator?.availability !== 'function') {
      setTranslationAbility('unavailable');
      return () => { availabilityRequestId.current += 1; };
    }
    checkTranslationAvailability(sourceLanguage, targetLanguage)
      .then(availability => { if (current === availabilityRequestId.current) setTranslationAbility(availability); })
      .catch(() => { if (current === availabilityRequestId.current) setTranslationAbility('unavailable'); });
    return () => { availabilityRequestId.current += 1; };
  }, [sourceLanguage, targetLanguage]);

  const handleTranslate = async () => {
    if (!sourceText.trim() || isLoading || !translationAbility || translationAbility === 'unavailable') return;
    const current = ++requestId.current;
    setTranslation('');
    setErrorMessage('');
    setIsLoading(true);
    try {
      if (useStreaming) {
        const stream = await translateStreaming(sourceText, sourceLanguage, targetLanguage);
        const reader = stream.getReader();
        try {
          while (current === requestId.current) {
            const { done, value } = await reader.read();
            if (done) break;
            if (current === requestId.current) setTranslation(prev => prev + value);
          }
        } finally {
          if (current !== requestId.current) await reader.cancel().catch(() => undefined);
          reader.releaseLock();
        }
      } else {
        const response = await translate(sourceText, sourceLanguage, targetLanguage);
        if (current === requestId.current) setTranslation(response);
      }
    } catch (error) {
      if (current === requestId.current) setErrorMessage(error instanceof Error ? error.message : 'Translation failed. Try again.');
    } finally {
      if (current === requestId.current) setIsLoading(false);
    }
  };

  const detectSourceLng = async () => {
    if (!sourceText.trim()) return;
    if (typeof window.LanguageDetector?.create !== 'function') {
      setErrorMessage('Language detection is unavailable in this browser. Select a source language instead.');
      return;
    }
    const current = requestId.current;
    try {
      const detectedLng = await detectPrimaryLanguage(sourceText);
      if (current !== requestId.current) return;
      if (languages.some(lang => lang.code === detectedLng)) setSourceLanguage(detectedLng);
      else setErrorMessage('Could not identify a supported language. Select it manually.');
    } catch (error) {
      if (current === requestId.current) setErrorMessage(error instanceof Error ? error.message : 'Language detection failed.');
    }
  };

  const checkAvailability = async () => {
    const current = ++availabilityRequestId.current;
    setTranslationAbility(undefined);
    if (sourceLanguage === targetLanguage || typeof window.Translator?.availability !== 'function') {
      setTranslationAbility('unavailable');
      return;
    }
    try {
      const availability = await checkTranslationAvailability(sourceLanguage, targetLanguage);
      if (current === availabilityRequestId.current) setTranslationAbility(availability);
    } catch {
      if (current === availabilityRequestId.current) setTranslationAbility('unavailable');
    }
  };

  return (
    <div className="min-h-screen bg-white dark:bg-gray-800 rounded-lg shadow-md transition-colors duration-200">
      <div className="max-w-6xl mx-auto p-4">
        {/* Header */}
        <header className="flex items-center justify-between mb-8">
          <div className="flex items-center space-x-4">
            <div className="bg-gradient-to-r from-primary-500 to-purple-600 text-white p-3 rounded-xl">
              <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5h12M9 3v2m1.048 9.5A18.022 18.022 0 016.412 9m6.088 9h7M11 21l5-10 5 10M12.751 5C11.783 10.77 8.07 15.61 3 18.129" />
              </svg>
            </div>
            <div>
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white">AI Translator</h1>
              <p className="text-gray-600 dark:text-gray-400">A real call to Chrome's Translator API; no translation is precomputed.</p>
            </div>
          </div>
        </header>
        <p className="mb-6 text-sm text-gray-700 dark:text-gray-300">Try the prefilled sentence. Chrome handles the translation on your device after downloading the language pack if needed. If this browser cannot run it, you'll see that instead of a made-up result.</p>

        <Tabs 
          defaultTab="docs"
          basePath="/translate"
          tabs={[
            {
              id: 'docs',
              label: 'API Documentation',
              path: '/translate-api-documentation',
              content: (
                <div className="max-w-none">
                  <DocsRenderer docFile="Translate-API.md" initOpen={true} />
                </div>
              )
            },
            {
              id: 'demo',
              label: 'Demo',
              path: '/translate-demo',
              content: (
                <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
                  {/* Settings Panel */}
                  <div className="lg:col-span-1 space-y-6">
                    {/* Language Settings */}
                    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 p-6 transition-colors duration-200">
                      <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center">
                        <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5h12M9 3v2m1.048 9.5A18.022 18.022 0 016.412 9m6.088 9h7M11 21l5-10 5 10M12.751 5C11.783 10.77 8.07 15.61 3 18.129" />
                        </svg>
                        Languages
                      </h3>
                      <div className="space-y-4">
                        <div>
                          <label htmlFor="sourceLanguage" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                            Source Language
                          </label>
                          <select
                            ref={selectRef}
                            id="sourceLanguage"
                            value={sourceLanguage}
                            onChange={e => { invalidateOutput(); setSourceLanguage(e.target.value); }}
                            className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                          >
                            {languages.map(lang => (
                              <option key={lang.code} value={lang.code}>{lang.name}</option>
                            ))}
                          </select>
                        </div>
                        <div>
                          <label htmlFor="targetLanguage" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                            Target Language
                          </label>
                          <select
                            id="targetLanguage"
                            value={targetLanguage}
                            onChange={e => { invalidateOutput(); setTargetLanguage(e.target.value); }}
                            className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                          >
                            {languages.map(lang => (
                              <option key={lang.code} value={lang.code}>{lang.name}</option>
                            ))}
                          </select>
                        </div>
                        <button
                          onClick={detectSourceLng}
                          disabled={!sourceText.trim()}
                          className="w-full bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200 px-3 py-2 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          Detect Language
                        </button>
                      </div>
                    </div>

                    {/* Settings */}
                    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 p-6 transition-colors duration-200">
                      <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center">
                        <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 100 4m0-4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 100 4m0-4v2m0-6V4" />
                        </svg>
                        Settings
                      </h3>
                      <div className="space-y-4">
                        <div className="flex items-center justify-between">
                          <label htmlFor="streaming" className="text-sm font-medium text-gray-700 dark:text-gray-300">
                            Stream Response
                          </label>
                          <input
                            id="streaming"
                            type="checkbox"
                            checked={useStreaming}
                            onChange={(e) => setUseStreaming(e.target.checked)}
                            className="rounded border-gray-300 text-primary-600 shadow-sm focus:border-primary-300 focus:ring focus:ring-primary-200 focus:ring-opacity-50"
                          />
                        </div>
                        <div className="flex items-center justify-between">
                          <button
                            onClick={checkAvailability}
                            className="bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200 px-3 py-2 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors duration-200"
                          >
                            Check Availability
                          </button>
                          <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                            {translationAbility && (
                              <span className={`px-2 py-1 rounded-full text-xs ${
                                translationAbility === 'available' ? 'bg-green-100 text-green-800 dark:bg-green-800 dark:text-green-100' :
                                translationAbility === 'downloadable' ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-800 dark:text-yellow-100' :
                                translationAbility === 'downloading' ? 'bg-blue-100 text-blue-800 dark:bg-blue-800 dark:text-blue-100' :
                                'bg-red-100 text-red-800 dark:bg-red-800 dark:text-red-100'
                              }`}>
                                {translationAbility}
                              </span>
                            )}
                          </span>
                        </div>
                        <p role="status" className="text-sm text-gray-700 dark:text-gray-300">
                          {sourceLanguage === targetLanguage
                            ? 'Choose two different languages to translate.'
                            : translationAbility === 'unavailable'
                              ? 'Translator API is unavailable for this language pair in this browser. Check your browser setup or try another pair.'
                              : translationAbility === 'downloadable' || translationAbility === 'downloading'
                                ? 'The language pack needs to download. Click Translate and allow time for the first run.'
                                : translationAbility === 'available'
                                  ? 'Translator API is ready for this language pair.'
                                  : 'Checking Translator API availability…'}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Translation Area */}
                  <div className="lg:col-span-3">
                    <div className="space-y-6">
                      {/* Input Area */}
                      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 p-6 transition-colors duration-200">
                        <label htmlFor="sourceText" className="block text-lg font-semibold text-gray-900 dark:text-white mb-4">
                          Text to Translate
                        </label>
                        <textarea
                          id="sourceText"
                          value={sourceText}
                          onChange={e => { invalidateOutput(); setSourceText(e.target.value); }}
                          className="w-full h-40 p-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-gray-100 placeholder-gray-500 dark:placeholder-gray-400 resize-none"
                          placeholder="Enter text to translate..."
                        />
                        <button
                          onClick={handleTranslate}
                          disabled={!sourceText.trim() || isLoading || !translationAbility || translationAbility === 'unavailable' || sourceLanguage === targetLanguage}
                          className="mt-4 w-full bg-primary-600 hover:bg-primary-700 disabled:bg-gray-400 text-white px-4 py-3 rounded-lg transition-colors duration-200 font-medium disabled:cursor-not-allowed"
                        >
                          {isLoading ? 'Translating...' : 'Translate'}
                        </button>
                      </div>

                      {/* Output Area */}
                      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 p-6 transition-colors duration-200">
                        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Translation</h3>
                        {errorMessage && <p role="alert" className="mb-3 text-sm text-red-700 dark:text-red-300">{errorMessage}</p>}
                        <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4 min-h-[150px] border border-gray-200 dark:border-gray-600" aria-live="polite">
                          {isLoading && !translation ? (
                            <Spinner label="Translating on-device…" />
                          ) : (
                            <pre className="whitespace-pre-wrap break-words text-gray-900 dark:text-gray-100 font-sans">
                              {translation || "Translation will appear here..."}
                            </pre>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )
            }
          ]}
        />
      </div>
    </div>
  );
};

export default TranslatePage;
