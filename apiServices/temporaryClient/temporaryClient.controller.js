import { begin, commit, rollback } from '../../database/transactions';

const confirmTemporaryClientController = async (req, res) => {
  const { temporaryCLientId } = req.params;
  const { organizationId } = req.body;

  try {
    await begin();

    // 

    await commit();
    res.send('El cliente temporal fue confirmado como organización.');
  } catch (ex) {
    await rollback();
    let err = 'Ocurrio un error al confirmar cliente temporal como organización.';
    let status = 500;
    if (ex instanceof CustomError) {
      err = ex.message;
      status = ex.status ?? 500;
    }
    res.statusMessage = err;
    res.status(status).send({ err, status });
  }
};

export { confirmTemporaryClientController };
