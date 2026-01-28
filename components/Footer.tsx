'use client'

import React from 'react'
import Link from 'next/link'

export default function Footer() {
    return (
        <footer className="border-t border-gray-100 bg-white py-12">
            <div className="mx-auto max-w-7xl px-4 flex flex-col md:flex-row justify-between gap-8 text-sm text-gray-500">
                <div className="space-y-4">
                    <div className="flex items-center gap-2">
                        <div className="flex h-6 w-6 items-center justify-center rounded-full bg-purple-100 text-purple-600">
                            <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M12 2c-4 0-8 5-8 11 0 4.5 3.5 9 8 9s8-4.5 8-9c0-6-4-11-8-11z" /><path d="M12 22V13" /><path d="M12 22c-3 0-5.5-2-5.5-5.5" /><path d="M12 22c3 0 5.5-2 5.5-5.5" /></svg>
                        </div>
                        <span className="font-bold text-gray-900">Onion<span className="text-purple-600">Parts</span></span>
                    </div>
                    <p className="max-w-xs">
                        신뢰할 수 있는 중고 자동차 부품 장터. 다양한 엔진, 브레이크, 인테리어 부품을 합리적인 가격에 만나보세요.
                    </p>
                </div>

                <div className="grid grid-cols-2 gap-8 sm:grid-cols-3">
                    <div>
                        <h4 className="font-semibold text-gray-900 mb-2">회사 소개</h4>
                        <ul className="space-y-1">
                            <li><Link href="#" className="hover:text-purple-600">OnionParts 소개</Link></li>
                            <li><Link href="#" className="hover:text-purple-600">채용 정보</Link></li>
                            <li><Link href="#" className="hover:text-purple-600">공지사항</Link></li>
                        </ul>
                    </div>
                    <div>
                        <h4 className="font-semibold text-gray-900 mb-2">고객 지원</h4>
                        <ul className="space-y-1">
                            <li><Link href="#" className="hover:text-purple-600">고객센터</Link></li>
                            <li><Link href="#" className="hover:text-purple-600">이용약관</Link></li>
                            <li><Link href="#" className="hover:text-purple-600">개인정보처리방침</Link></li>
                        </ul>
                    </div>
                    <div>
                        <h4 className="font-semibold text-gray-900 mb-2">소셜 미디어</h4>
                        <ul className="space-y-1">
                            <li><Link href="#" className="hover:text-purple-600">Twitter</Link></li>
                            <li><Link href="#" className="hover:text-purple-600">Instagram</Link></li>
                            <li><Link href="#" className="hover:text-purple-600">LinkedIn</Link></li>
                        </ul>
                    </div>
                </div>
            </div>
            <div className="mx-auto max-w-7xl px-4 mt-8 pt-8 border-t border-gray-100 text-xs text-gray-400 text-center">
                &copy; {new Date().getFullYear()} OnionParts Inc. All rights reserved.
            </div>
        </footer>
    )
}
