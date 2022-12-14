import React from 'react'

import { FrameCorners } from '@arwes/core'

export const HUDButtons = ({ activate }: { activate: boolean }) => {
    return (
        <div className='absolute h-screen w-screen flex flex-col justify-end items-center'>
            <div
                style={{ width: 500, height: 100 }}
                className='mb-8 flex flex-row space-x-6 justify-center items-center pointer-events-auto'
            >
                {/* @ts-ignore */}
                <FrameCorners
                    animator={{ activate }}
                    hover
                    showContentLines
                    contentLineWidth={1}
                    className='h-16 w-16 shadow-xl shadow-cyan-800/50'
                >
                    <svg
                        version='1.1'
                        id='Capa_1'
                        xmlns='http://www.w3.org/2000/svg'
                        x='0px'
                        y='0px'
                        viewBox='0 0 60.123 60.123'
                        enableBackground='new 0 0 60.123 60.123;'
                        width='44'
                        height='44'
                        className='fill-cyan-500 bg-transparent'
                    >
                        <g>
                            <path d='M57.124,51.893H16.92c-1.657,0-3-1.343-3-3s1.343-3,3-3h40.203c1.657,0,3,1.343,3,3S58.781,51.893,57.124,51.893z' />
                            <path
                                d='M57.124,33.062H16.92c-1.657,0-3-1.343-3-3s1.343-3,3-3h40.203c1.657,0,3,1.343,3,3
		C60.124,31.719,58.781,33.062,57.124,33.062z'
                            />
                            <path d='M57.124,14.231H16.92c-1.657,0-3-1.343-3-3s1.343-3,3-3h40.203c1.657,0,3,1.343,3,3S58.781,14.231,57.124,14.231z' />
                            <circle cx='4.029' cy='11.463' r='4.029' />
                            <circle cx='4.029' cy='30.062' r='4.029' />
                            <circle cx='4.029' cy='48.661' r='4.029' />
                        </g>
                        <g></g>
                        <g></g>
                        <g></g>
                        <g></g>
                        <g></g>
                        <g></g>
                        <g></g>
                        <g></g>
                        <g></g>
                        <g></g>
                        <g></g>
                        <g></g>
                        <g></g>
                        <g></g>
                        <g></g>
                    </svg>
                </FrameCorners>
                {/* @ts-ignore */}
                <FrameCorners
                    animator={{ activate }}
                    hover
                    showContentLines
                    contentLineWidth={1}
                    className='h-16 w-16 shadow-xl shadow-cyan-800/50'
                >
                    <svg
                        viewBox='0 0 32 32'
                        xmlns='http://www.w3.org/2000/svg'
                        width='44'
                        height='44'
                        className='fill-cyan-500 bg-transparent'
                    >
                        <g id='Layer_2' data-name='Layer 2'>
                            <path d='m2.87 28.56a1.88 1.88 0 0 1 -1.87-1.87v-15.38a3.88 3.88 0 0 1 3.87-3.87h18.25a3.88 3.88 0 0 1 3.88 3.87v10.25a3.88 3.88 0 0 1 -3.87 3.88h-15.22a.82.82 0 0 0 -.48.16l-3.43 2.59a1.89 1.89 0 0 1 -1.13.37zm2-19.12a1.88 1.88 0 0 0 -1.87 1.87v15.13l3.23-2.44a2.84 2.84 0 0 1 1.68-.56h15.21a1.88 1.88 0 0 0 1.88-1.88v-10.25a1.88 1.88 0 0 0 -1.87-1.87z' />
                            <circle cx='17.94' cy='16.53' r='1' />
                            <circle cx='14.06' cy='16.53' r='1' />
                            <circle cx='10.06' cy='16.53' r='1' />
                            <path d='m30 18.44a1 1 0 0 1 -1-1v-10.13a1.88 1.88 0 0 0 -1.87-1.87h-20.13a1 1 0 0 1 -1-1 1 1 0 0 1 1-1h20.13a3.88 3.88 0 0 1 3.87 3.87v10.13a1 1 0 0 1 -1 1z' />
                        </g>
                    </svg>
                </FrameCorners>

                {/* @ts-ignore */}
                <FrameCorners
                    animator={{ activate }}
                    hover
                    showContentLines
                    contentLineWidth={1}
                    className='h-16 w-16 shadow-xl shadow-cyan-800/50'
                >
                    <svg
                        version='1.1'
                        id='Capa_1'
                        xmlns='http://www.w3.org/1999/xlink'
                        x='0px'
                        y='0px'
                        viewBox='0 0 512.032 512.032'
                        enableBackground='new 0 0 512.032 512.032;'
                        className='fill-cyan-500 bg-transparent'
                    >
                        <g>
                            <g>
                                <path
                                    d='M496.016,224c-8.832,0-16,7.168-16,16v181.184l-128,51.2V304c0-8.832-7.168-16-16-16c-8.832,0-16,7.168-16,16v168.352
			l-128-51.2V167.648l74.144,29.664c8.096,3.264,17.504-0.704,20.8-8.928c3.296-8.192-0.704-17.504-8.928-20.8l-95.776-38.336
			c0,0,0,0-0.032,0l-0.256-0.096c-3.808-1.536-8.064-1.536-11.872,0l-0.288,0.096c0,0,0,0-0.032,0L10.064,193.152
			C4.016,195.584,0.016,201.44,0.016,208v288c0,5.312,2.656,10.272,7.04,13.248c2.688,1.824,5.792,2.752,8.96,2.752
			c2.016,0,4.032-0.384,5.952-1.152l154.048-61.6l153.76,61.504c0,0,0,0,0.032,0l0.288,0.128c3.808,1.536,8.064,1.536,11.872,0
			l0.288-0.128c0,0,0,0,0.032,0L502,446.88c6.016-2.464,10.016-8.32,10.016-14.88V240C512.016,231.168,504.848,224,496.016,224z
			 M160.016,421.152l-128,51.2V218.816l128-51.2V421.152z'
                                />
                            </g>
                        </g>
                        <g>
                            <g>
                                <path
                                    d='M400.016,64c-26.464,0-48,21.536-48,48s21.536,48,48,48s48-21.536,48-48S426.48,64,400.016,64z M400.016,128
			c-8.832,0-16-7.168-16-16c0-8.832,7.168-16,16-16c8.832,0,16,7.168,16,16C416.016,120.832,408.848,128,400.016,128z'
                                />
                            </g>
                        </g>
                        <g>
                            <g>
                                <path
                                    d='M400.016,0c-61.76,0-112,50.24-112,112c0,57.472,89.856,159.264,100.096,170.688c3.04,3.36,7.36,5.312,11.904,5.312
			s8.864-1.952,11.904-5.312C422.16,271.264,512.016,169.472,512.016,112C512.016,50.24,461.776,0,400.016,0z M400.016,247.584
			c-34.944-41.44-80-105.056-80-135.584c0-44.096,35.904-80,80-80s80,35.904,80,80C480.016,142.496,434.96,206.144,400.016,247.584z
			'
                                />
                            </g>
                        </g>
                        <g></g>
                        <g></g>
                        <g></g>
                        <g></g>
                        <g></g>
                        <g></g>
                        <g></g>
                        <g></g>
                        <g></g>
                        <g></g>
                        <g></g>
                        <g></g>
                        <g></g>
                        <g></g>
                        <g></g>
                    </svg>
                </FrameCorners>

                {/* @ts-ignore */}
                <FrameCorners
                    animator={{ activate }}
                    hover
                    showContentLines
                    contentLineWidth={1}
                    className='h-16 w-16 shadow-xl shadow-cyan-800/50'
                >
                    <svg
                        id='Capa_1'
                        enableBackground='new 0 0 512 512'
                        viewBox='0 0 512 512'
                        xmlns='http://www.w3.org/2000/svg'
                        width='44'
                        height='44'
                        className='fill-cyan-500 bg-transparent'
                    >
                        <path d='m426.086 115.905-29.997-29.996c-.573-.573-1.172-1.112-1.792-1.618-4.201-3.432-9.41-5.298-14.907-5.298s-10.706 1.866-14.907 5.298c-.62.506-1.218 1.045-1.792 1.618l-355.781 355.782c-9.206 9.208-9.206 24.189 0 33.396l29.996 29.997c4.461 4.46 10.391 6.917 16.698 6.917s12.237-2.457 16.698-6.917l231.462-231.462c2.929-2.929 2.929-7.678 0-10.606-2.93-2.929-7.678-2.929-10.607 0l-231.462 231.461c-3.357 3.359-8.824 3.358-12.182 0l-29.995-29.997c-3.359-3.359-3.359-8.824 0-12.183l277.847-277.847 42.178 42.179-20.737 20.737c-2.929 2.929-2.929 7.678 0 10.606 2.93 2.928 7.678 2.93 10.607 0l98.673-98.672c4.46-4.46 6.916-10.39 6.916-16.698 0-2.365-.345-4.678-1.012-6.879-1.112-3.668-3.116-7.03-5.904-9.818zm-120.115 47.939 67.329-67.328c.208-.208.424-.403.647-.585.039-.032.081-.058.121-.089.189-.149.38-.294.579-.425.013-.008.027-.015.04-.024 2.85-1.859 6.567-1.858 9.417.004.01.007.021.012.032.019.201.132.395.279.585.43.038.03.078.055.115.085.223.182.44.377.648.585l29.996 29.996c3.359 3.359 3.359 8.824 0 12.183l-67.329 67.329z' />
                        <path d='m274.797 44.165h21.664v21.664c0 4.142 3.357 7.5 7.5 7.5s7.5-3.358 7.5-7.5v-21.664h21.665c4.143 0 7.5-3.358 7.5-7.5s-3.357-7.5-7.5-7.5h-21.665v-21.665c0-4.142-3.357-7.5-7.5-7.5s-7.5 3.358-7.5 7.5v21.665h-21.664c-4.143 0-7.5 3.358-7.5 7.5s3.357 7.5 7.5 7.5z' />
                        <path d='m446.165 44.165h21.665v21.664c0 4.142 3.357 7.5 7.5 7.5s7.5-3.358 7.5-7.5v-21.664h21.664c4.143 0 7.5-3.358 7.5-7.5s-3.357-7.5-7.5-7.5h-21.664v-21.665c0-4.142-3.357-7.5-7.5-7.5s-7.5 3.358-7.5 7.5v21.665h-21.665c-4.143 0-7.5 3.358-7.5 7.5s3.358 7.5 7.5 7.5z' />
                        <path d='m502.967 211.387h-21.665v-21.664c0-4.142-3.357-7.5-7.5-7.5s-7.5 3.358-7.5 7.5v21.664h-21.664c-4.143 0-7.5 3.358-7.5 7.5s3.357 7.5 7.5 7.5h21.664v21.665c0 4.142 3.357 7.5 7.5 7.5s7.5-3.358 7.5-7.5v-21.665h21.665c4.143 0 7.5-3.358 7.5-7.5s-3.358-7.5-7.5-7.5z' />
                    </svg>
                </FrameCorners>
            </div>
        </div>
    )
}
