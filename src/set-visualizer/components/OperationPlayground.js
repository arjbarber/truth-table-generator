import CardinalityPlayground from '../playgrounds/CardinalityPlayground';
import CartesianPlayground from '../playgrounds/CartesianPlayground';
import KSubsetsPlayground from '../playgrounds/KSubsetsPlayground';
import MembershipPlayground from '../playgrounds/MembershipPlayground';
import PowerSetPlayground from '../playgrounds/PowerSetPlayground';
import VennPlayground from '../playgrounds/VennPlayground';

const playgrounds = {
  'set-membership': MembershipPlayground,
  cardinality: CardinalityPlayground,
  subset: (props) => <VennPlayground {...props} mode="subset" />,
  'set-equality': (props) => <VennPlayground {...props} mode="set-equality" />,
  union: (props) => <VennPlayground {...props} mode="union" />,
  intersection: (props) => <VennPlayground {...props} mode="intersection" />,
  'set-difference': (props) => <VennPlayground {...props} mode="set-difference" />,
  complement: (props) => <VennPlayground {...props} mode="complement" />,
  'symmetric-difference': (props) => <VennPlayground {...props} mode="symmetric-difference" />,
  'disjoint-union': (props) => <VennPlayground {...props} mode="disjoint-union" />,
  'cartesian-product': CartesianPlayground,
  'power-set': PowerSetPlayground,
  'k-subsets': KSubsetsPlayground,
};

const OperationPlayground = ({ operation }) => {
  const Component = playgrounds[operation.id];

  if (!Component) {
    return (
      <div className="rounded-2xl bg-slate-100 p-4 text-sm text-slate-500">
        Interactive mode coming soon.
      </div>
    );
  }

  return <Component operation={operation} />;
};

export default OperationPlayground;
