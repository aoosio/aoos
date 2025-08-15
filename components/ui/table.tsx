import * as React from 'react'
export function Table({ children }: { children: React.ReactNode }) { return <div className="overflow-x-auto"><table className="min-w-full text-sm">{children}</table></div> }
export function THead({ children }: { children: React.ReactNode }) { return <thead className="text-left text-slate-500">{children}</thead> }
export function TBody({ children }: { children: React.ReactNode }) { return <tbody className="divide-y divide-slate-100">{children}</tbody> }
export function TR({ children }: { children: React.ReactNode }) { return <tr className="hover:bg-slate-50/50">{children}</tr> }
export function TH({ children }: { children: React.ReactNode }) { return <th className="px-3 py-2 font-medium">{children}</th> }
export function TD({ children }: { children: React.ReactNode }) { return <td className="px-3 py-2">{children}</td> }