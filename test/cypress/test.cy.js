describe('顧客情報入力フォームのテスト', () => {
  it('顧客情報を入力して送信し、成功メッセージを確認する', () => {
     // テスト対象のページにアクセス

    // テストデータの読み込み
    cy.fixture('customerData').then((data) => {
      // フォームの入力フィールドにテストデータを入力
      const uniqueCompanyName = `${data.companyName}-${Date.now()}`;
      const uniqueContactNumber = `03-${Math.floor(1000 + Math.random() * 9000)}-${Math.floor(1000 + Math.random() * 9000)}`;
      
      cy.visit('/taketomo_suzuki/customer/add.html');

      cy.get('#companyName').type(uniqueCompanyName);
      cy.get('#industry').type(data.industry);
      cy.get('#contact').type(data.contact);
      cy.get('#location').type(data.location);
    });

    // フォームの送信
    cy.get('#customer-form').submit();

    // ページ遷移を確認
    cy.location('pathname').should('include', 'add-confirm.html');


    // alert を再スタブ化（遷移後の window に対して）
    cy.window().then((win) => {
      cy.stub(win, 'alert').as('alertStub');
    });
    
    cy.get('#save-btn').click();

    cy.get('@alertStub').should('have.been.calledOnceWith', '顧客情報が正常に保存されました。');

    // フォームがリセットされたことを確認
    cy.get('#companyName').should('have.value', '');
    cy.get('#industry').should('have.value', '');
    cy.get('#contact').should('have.value', '');
    cy.get('#location').should('have.value', '');
    cy.wait(5000);
  });
});