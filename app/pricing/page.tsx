const plans = [
  {
    name: 'Solo Advocate',
    price: '$39/mo',
    features: ['Verified profile', 'Matter workspace', 'Evidence hashing', 'AI drafting with validation gate']
  },
  {
    name: 'Chambers/Firm',
    price: '$99/mo',
    features: ['Team roles', 'Shared matters', 'Review queues', 'Admin console access']
  },
  {
    name: 'Enterprise / Panel',
    price: 'Custom',
    features: ['Structured panels', 'Advanced compliance', 'Dedicated support']
  }
]

export default function PricingPage() {
  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-semibold">Pricing</h1>
      <div className="grid md:grid-cols-3 gap-4">
        {plans.map((plan) => (
          <div key={plan.name} className="border bg-white rounded-lg p-4 shadow-sm">
            <h3 className="text-lg font-semibold">{plan.name}</h3>
            <p className="text-2xl font-bold mt-2">{plan.price}</p>
            <ul className="mt-3 space-y-2 text-sm text-slate-600">
              {plan.features.map((f) => (
                <li key={f}>• {f}</li>
              ))}
            </ul>
            <button className="mt-4 px-4 py-2 bg-accent text-white rounded w-full">Select</button>
          </div>
        ))}
      </div>
    </div>
  )
}
