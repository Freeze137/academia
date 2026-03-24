// ==========================================
// DADOS ESTÁTICOS (TREINOS E VÍDEOS)
// ==========================================

const workouts = [
    {
        id: 'upper',
        name: 'Treino de Superiores',
        muscleGroups: ['Peito', 'Costas', 'Ombros', 'Bíceps', 'Tríceps'],
        exercises: [
            { name: 'Supino', sets: 4, reps: '8-10', muscleGroup: 'Peito' },
            { name: 'Puxada Frontal', sets: 4, reps: '8-10', muscleGroup: 'Costas' },
            { name: 'Desenvolvimento de Ombros', sets: 3, reps: '10-12', muscleGroup: 'Ombros' },
            { name: 'Rosca Direta', sets: 3, reps: '10-12', muscleGroup: 'Bíceps' },
            { name: 'Extensão de Tríceps', sets: 3, reps: '10-12', muscleGroup: 'Tríceps' }
        ]
    },
    {
        id: 'lower',
        name: 'Treino de Inferiores',
        muscleGroups: ['Glúteos', 'Quadríceps', 'Isquiotibiais', 'Panturrilha'],
        exercises: [
            { name: 'Agachamento', sets: 4, reps: '8-10', muscleGroup: 'Quadríceps' },
            { name: 'Leg Press', sets: 4, reps: '8-10', muscleGroup: 'Glúteos' },
            { name: 'Rosca Direta de Perna', sets: 3, reps: '10-12', muscleGroup: 'Isquiotibiais' },
            { name: 'Leg Curls', sets: 3, reps: '12-15', muscleGroup: 'Isquiotibiais' },
            { name: 'Cálculo na Máquina', sets: 3, reps: '15-20', muscleGroup: 'Panturrilha' }
        ]
    },
    {
        id: 'push',
        name: 'Dia de Empurrada (Push)',
        muscleGroups: ['Peito', 'Ombros', 'Tríceps'],
        exercises: [
            { name: 'Supino Inclinado', sets: 4, reps: '8-10', muscleGroup: 'Peito' },
            { name: 'Rosca Francesa', sets: 3, reps: '10-12', muscleGroup: 'Tríceps' },
            { name: 'Fly Máquina', sets: 3, reps: '12-15', muscleGroup: 'Peito' },
            { name: 'Elevação Lateral', sets: 3, reps: '12-15', muscleGroup: 'Ombros' }
        ]
    },
    {
        id: 'pull',
        name: 'Dia de Puxada (Pull)',
        muscleGroups: ['Costas', 'Bíceps'],
        exercises: [
            { name: 'Barra Fixa', sets: 4, reps: '8-10', muscleGroup: 'Costas' },
            { name: 'Rosca Direta com Barra', sets: 4, reps: '8-10', muscleGroup: 'Bíceps' },
            { name: 'Remada Unilateral', sets: 3, reps: '10-12', muscleGroup: 'Costas' },
            { name: 'Rosca Scott', sets: 3, reps: '10-12', muscleGroup: 'Bíceps' }
        ]
    },
    {
        id: 'fullbody',
        name: 'Full Body',
        muscleGroups: ['Corpo Todo'],
        exercises: [
            { name: 'Agachamento', sets: 3, reps: '8-10', muscleGroup: 'Pernas' },
            { name: 'Supino', sets: 3, reps: '8-10', muscleGroup: 'Peito' },
            { name: 'Barra Fixa', sets: 3, reps: '8-10', muscleGroup: 'Costas' },
            { name: 'Rosca Direta', sets: 2, reps: '10-12', muscleGroup: 'Bíceps' }
        ]
    }
];

const videos = {
    warmup: {
        title: '🔥 Aquecimento Completo',
        duration: '6 min',
        description: 'Aquecimento essencial antes de qualquer treino para preparar músculos e articulações',
        url: 'https://www.youtube.com/embed/ixkQaZXVQjs'
    },
    squat: {
        title: '🦵 Agachamento Livre',
        duration: '10 min',
        description: 'Aprenda a postura correta para o agachamento livre focado em quadríceps e glúteos.',
        url: 'https://www.youtube.com/embed/gcNh17Ckjgg'
    },
    legpress: {
        title: '🦵 Leg Press 45º - Técnica Correta',
        duration: '8 min',
        description: 'Aprenda a forma correta de usar a máquina de leg press sem prejudicar os joelhos',
        url: 'https://www.youtube.com/embed/T2xAc5BYHbw'
    },
    benchpress: {
        title: '🏋️ Supino Reto - Guia Completo',
        duration: '12 min',
        description: 'Posicionamento, respiração e movimento correto do supino para máximo ganho de força',
        url: 'https://www.youtube.com/embed/rT7DgCr-3pg'
    },
    latpulldown: {
        title: '🦅 Puxada Frontal (Costas)',
        duration: '9 min',
        description: 'Como ativar as dorsais corretamente na puxada de polia alta.',
        url: 'https://www.youtube.com/embed/CAwf7n6Luuc'
    },
    shoulderpress: {
        title: '🛡️ Desenvolvimento de Ombros',
        duration: '7 min',
        description: 'Proteja suas articulações e ganhe volume nos ombros com esta técnica.',
        url: 'https://www.youtube.com/embed/qEwKCR5JCog'
    },
    bicepscurl: {
        title: '💪 Rosca Direta - Forma Perfeita',
        duration: '10 min',
        description: 'Técnica correta para rosca direta com foco na amplitude de movimento',
        url: 'https://www.youtube.com/embed/in7PaeYlhrM'
    },
    deadlift: {
        title: '💥 Levantamento Terra (Deadlift)',
        duration: '15 min',
        description: 'O guia definitivo para fazer o levantamento terra com segurança e muita carga.',
        url: 'https://www.youtube.com/embed/op9kVnSso6Q'
    }
};