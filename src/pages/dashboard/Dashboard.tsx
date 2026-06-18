import { useQuery } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import { FiBarChart2 } from 'react-icons/fi';

function Dashboard() {
  const { data, isLoading } = useQuery({
    queryKey: ['dashboard-summary'],
    queryFn: async () => ({
      students: 184,
      classes: 12,
      attendance: '92%',
    }),
  });

  return (
    <motion.section
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      className="rounded-4xl border border-white/10 bg-white/5 p-6 backdrop-blur"
    >
      <div className="flex items-center gap-3 text-violet-200">
        <FiBarChart2 className="text-xl" />
        <h2 className="text-2xl font-semibold text-white">Dashboard</h2>
      </div>
      <p className="mt-3 text-sm leading-6 text-slate-300">
        {isLoading
          ? 'Carregando dados do dashboard...'
          : `Alunos: ${data?.students} | Turmas: ${data?.classes} | Frequência: ${data?.attendance}`}
      </p>
    </motion.section>
  );
}

export default Dashboard;
